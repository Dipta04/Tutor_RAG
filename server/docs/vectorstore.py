
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone

from config.db import chunk_collection

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "tutor-rags")

if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

UPLOAD_DIR = "./upload_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
UPSERT_BATCH = 100


pc = None
index = None


def get_pinecone_index():
    global pc, index
    if index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
    return index


class DocumentIngestError(Exception):
    """Raised when an uploaded file cannot be indexed."""


def _safe_filename(name: str) -> str:
    """Strip any directory component so uploads cannot escape UPLOAD_DIR."""
    return Path(name or "document.pdf").name


async def load_vectorstore(uploaded_files, role: str, doc_id: str, grade: int) -> int:
    """Index the uploaded PDFs. Returns the number of chunks stored."""
    embed_model = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    pinecone_index = get_pinecone_index()
    total_chunks = 0

    for file in uploaded_files:
        filename = _safe_filename(file.filename)


        save_path = Path(UPLOAD_DIR) / filename
        contents = await file.read()
        if not contents:
            raise DocumentIngestError(f"{filename} is empty")
        save_path.write_bytes(contents)


        loader = PyPDFLoader(str(save_path))
        documents = loader.load()


        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )
        chunks = splitter.split_documents(documents)


        if not chunks:
            raise DocumentIngestError(
                f"No text could be extracted from {filename}. "
                "Scanned PDFs need OCR before they can be indexed."
            )


        chunk_docs = [
            {
                "chunk_id": f"{doc_id}-{i}",
                "doc_id": doc_id,
                "text": chunk.page_content,
                "page": int(chunk.metadata.get("page", 0)),
                "source": filename,
                "grade": grade,
                "role": role,
            }
            for i, chunk in enumerate(chunks)
        ]
        chunk_collection.insert_many(chunk_docs)


        texts = [chunk.page_content for chunk in chunks]
        embeddings = await asyncio.to_thread(embed_model.embed_documents, texts)


        vectors = [
            (
                f"{doc_id}-{i}",
                embeddings[i],
                {
                    "doc_id": doc_id,
                    "page": int(chunks[i].metadata.get("page", 0)),
                    "source": filename,
                    "grade": grade,
                    "role": role,
                },
            )
            for i in range(len(embeddings))
        ]

        for start in range(0, len(vectors), UPSERT_BATCH):
            batch = vectors[start : start + UPSERT_BATCH]
            await asyncio.to_thread(pinecone_index.upsert, vectors=batch)

        total_chunks += len(chunks)
        print(f"Indexed {filename} ({len(chunks)} chunks)")

    return total_chunks
