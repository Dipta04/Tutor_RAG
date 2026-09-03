from fastapi import FastAPI

from auth.route import router as auth_router
from docs.route import router as doc_router
from chat.route import router as chat_router

app = FastAPI(title="TutorRAG API", version="1.0.0")

app.include_router(auth_router)
app.include_router(doc_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {"message": "Welcome to the User Management API"}
