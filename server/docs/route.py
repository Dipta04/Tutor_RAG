import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .vectorstore import DocumentIngestError, load_vectorstore

router = APIRouter()

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB


@router.post("/upload_docs")
async def upload_docs(file: UploadFile = File(...), grade: int = Form(...)):
    """
    Upload a PDF document and index it into:
    - MongoDB (full text chunks)
    - Pinecone (embeddings only)

    Access is set to 'Public' by default.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if not 1 <= grade <= 12:
        raise HTTPException(status_code=400, detail="Grade must be between 1 and 12")

    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File is larger than 25 MB")

    doc_id = str(uuid.uuid4())
    ACCESS_ROLE = "Public"

    try:
        chunks = await load_vectorstore(
            uploaded_files=[file],
            role=ACCESS_ROLE,
            doc_id=doc_id,
            grade=grade,
        )
    except DocumentIngestError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        print("Error during document upload:", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to process and index the document",
        )

    return {
        "message": f"{file.filename} uploaded and indexed successfully",
        "doc_id": doc_id,
        "grade": grade,
        "chunks": chunks,
        "access": ACCESS_ROLE,
    }
