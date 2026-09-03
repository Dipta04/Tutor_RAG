"""
OPTIONAL: exchanges a Google identity for TutorRAG credentials.

Not wired into main.py by default. Read the "Google sign-in" section of the
README before enabling it, and note that it has not been tested end to end.

The rest of the API authenticates with HTTP Basic, which needs a reusable
password on every request. A Google account has none, so the first time
somebody signs in with Google this endpoint generates a random password,
stores its bcrypt hash and hands the plaintext back to the Next.js server,
which keeps it in the same httpOnly cookie as a normal sign-in. Nothing else
in the API has to change.

Only the Next.js server may call this. It proves that with a shared secret,
and it is the party that verified the Google token.
"""

import os
import re
import secrets

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from config.db import users_collection

from .hash_utils import hash_password
from .model import EMAIL_PATTERN

router = APIRouter(prefix="/auth")

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")
GENERATED_PASSWORD_BYTES = 24


class GoogleIdentity(BaseModel):
    email: str = Field(pattern=EMAIL_PATTERN)
    name: str = Field(default="", max_length=120)
    google_id: str = Field(min_length=1, max_length=64)
    grade: int = Field(default=1, ge=1, le=12)


def _username_from_email(email: str) -> str:
    """Builds a username that is unique in the users collection."""
    base = re.sub(r"[^a-z0-9]", "", email.split("@")[0].lower())[:24] or "student"
    candidate = base
    suffix = 1
    while users_collection.find_one({"username": candidate}):
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


@router.post("/google")
def exchange_google_identity(
    identity: GoogleIdentity,
    x_internal_key: str = Header(default=""),
):
    if not INTERNAL_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured on the server",
        )

    if not secrets.compare_digest(x_internal_key, INTERNAL_API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")

    email = identity.email.lower()
    user = users_collection.find_one({"email": email})
    password = secrets.token_urlsafe(GENERATED_PASSWORD_BYTES)

    if user is None:
        username = _username_from_email(email)
        users_collection.insert_one(
            {
                "fullname": identity.name or username,
                "email": email,
                "username": username,
                "password": hash_password(password),
                "role": "Student",
                "grade": identity.grade,
                "school": "",
                "auth_provider": "google",
                "google_id": identity.google_id,
            }
        )
        return {
            "username": username,
            "password": password,
            "fullname": identity.name or username,
            "role": "Student",
            "grade": identity.grade,
        }

    # An account made with a password must keep it: rotating it here would lock
    # the owner out of the sign-in form they already use.
    if user.get("auth_provider") != "google":
        raise HTTPException(
            status_code=409,
            detail="An account already uses this email. Sign in with your username and password.",
        )

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hash_password(password), "google_id": identity.google_id}},
    )

    return {
        "username": user["username"],
        "password": password,
        "fullname": user.get("fullname", user["username"]),
        "role": user.get("role", "Student"),
        "grade": user.get("grade", 0),
    }
