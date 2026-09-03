import asyncio
import os

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from pinecone import Pinecone

from config.db import chunk_collection

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

TOP_K = 5

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

embed_model = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

llm = ChatGroq(
    temperature=0.3,
    model_name="openai/gpt-oss-120b",
    groq_api_key=GROQ_API_KEY,
)

rag_prompt = PromptTemplate.from_template(
    """
You are a helpful educational assistant.
Answer the question using ONLY the context below.

Question:
{question}

Context:
{context}

If relevant, mention the document source.

"""
)

quiz_prompt = PromptTemplate.from_template(
    """
You are a test-generating assistant.

Using the context below, generate {num_questions}
multiple-choice questions.

Format STRICTLY as:

Question 1: ...
A) ...
B) ...
C) ...
Correct Answer: A

Do not use bold, italics or any other markdown around the labels.

Context:
{context}
"""
)

rag_chain = rag_prompt | llm
quiz_chain = quiz_prompt | llm


def _retrieve_context(embedding: list[float], user_role: str, user_grade: int):
    """Query pinecone, then pull the matching chunk text back out of mongodb."""
    results = index.query(
        vector=embedding,
        top_k=TOP_K,
        include_metadata=True,
        filter={
            "grade": user_grade,
            "role": {"$in": ["Public", user_role]},
        },
    )

    matches = results.get("matches") or []
    if not matches:
        return None, []

    chunk_ids = [m["id"] for m in matches]
    docs = list(chunk_collection.find({"chunk_id": {"$in": chunk_ids}}))
    if not docs:
        return None, []

    # preserve the relevance order returned by pinecone
    doc_map = {d["chunk_id"]: d for d in docs}
    ordered = [doc_map[cid] for cid in chunk_ids if cid in doc_map]
    if not ordered:
        return None, []

    context = "\n\n".join(d["text"] for d in ordered)
    sources = sorted({d["source"] for d in ordered})
    return context, sources


def _as_text(response) -> str:
    return response.content if hasattr(response, "content") else str(response)


async def answer_query(query: str, user_role: str, user_grade: int) -> dict:
    embedding = await asyncio.to_thread(embed_model.embed_query, query)
    
    context, sources = await asyncio.to_thread(
        _retrieve_context, embedding, user_role, user_grade
    )
    if context is None:
        return {
            "answer": "No study material matches that question yet. "
            "Ask your teacher to upload the relevant document.",
            "sources": [],
        }
    
    response = await asyncio.to_thread(
        rag_chain.invoke,
        {"question": query, "context": context},
    )
    return {"answer": _as_text(response), "sources": sources}


async def quiz_generation(
    topic: str,
    user_role: str,
    user_grade: int,
    num_questions: int = 3,
) -> dict:
    embedding = await asyncio.to_thread(embed_model.embed_query, topic)
    
    context, sources = await asyncio.to_thread(
        _retrieve_context, embedding, user_role, user_grade
    )
    if context is None:
        return {
            "quiz": "",
            "sources": [],
            "error": "No study material matches that topic yet.",
        }
    
    response = await asyncio.to_thread(
        quiz_chain.invoke,
        {"num_questions": num_questions, "context": context},
    )
    return {"quiz": _as_text(response), "sources": sources, "error": None}
