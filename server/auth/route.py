from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from config.db import users_collection

from .hash_utils import hash_password, verify_password
from .model import StudentUser, TeacherUser

router = APIRouter()
security = HTTPBasic()


def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    """Authenticate a user using HTTP Basic Auth."""
    user = users_collection.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user.get("password")):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return {
        "username": user.get("username"),
        "fullname": user.get("fullname", ""),
        "role": user.get("role"),
        "grade": user.get("grade", 0),
        "user_id": str(user.get("_id")),
    }


@router.post("/signup/student")
def signup_student(req: StudentUser):
    """Handle a student signup request."""
    if users_collection.find_one({"username": req.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(req.password)
    users_collection.insert_one(
        {
            "fullname": req.fullname,
            "email": req.email,
            "username": req.username,
            "password": hashed_password,
            "role": "Student",
            "grade": req.grade,
            "school": req.school,
        }
    )
    return {"message": "Student user created successfully"}


@router.post("/signup/teacher")
def signup_teacher(req: TeacherUser):
    """Handle a teacher signup request."""
    if users_collection.find_one({"username": req.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(req.password)
    users_collection.insert_one(
        {
            "fullname": req.fullname,
            "email": req.email,
            "username": req.username,
            "password": hashed_password,
            "role": "Teacher",
            "school": req.school,
        }
    )
    return {"message": "Teacher user created successfully"}


@router.get("/login")
def login(user=Depends(authenticate)):
    """Validate credentials and return the profile the client needs."""
    return {
        "message": f"Welcome {user['username']}",
        "username": user["username"],
        "fullname": user["fullname"],
        "role": user["role"],
        "grade": user["grade"],
    }
