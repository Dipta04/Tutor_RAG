from pydantic import BaseModel, Field

# Kept as a plain pattern instead of pydantic's EmailStr so that no extra
# dependency (email-validator) is required.
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class StudentUser(BaseModel):
    fullname: str = Field(min_length=1, max_length=120)
    email: str = Field(pattern=EMAIL_PATTERN)
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    grade: int = Field(ge=1, le=12)
    school: str = Field(min_length=1, max_length=160)


class TeacherUser(BaseModel):
    fullname: str = Field(min_length=1, max_length=120)
    email: str = Field(pattern=EMAIL_PATTERN)
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    school: str = Field(min_length=1, max_length=160)
