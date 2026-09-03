import datetime
import re
from typing import List, Optional

from bson.errors import InvalidId
from bson.objectid import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.route import authenticate
from chat.chat_query import answer_query, quiz_generation
from config.db import chat_history_collection, quiz_history, quizzes_collection

router = APIRouter()

# Matches "Correct Answer: B", "**Correct Answer:** B", "correct answer - b)".
CORRECT_ANSWER_RE = re.compile(
    r"^\s*[*_\s]*correct\s*answer[*_\s]*[:\-]\s*[*_\s]*([A-Za-z])",
    re.IGNORECASE,
)


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    num_questions: Optional[int] = Field(default=3, ge=1, le=10)


class QuizAnswerRequest(BaseModel):
    quiz_id: str
    answers: List[str]


def _utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _extract_correct_answers(quiz_text: str) -> List[str]:
    answers = []
    for line in quiz_text.splitlines():
        match = CORRECT_ANSWER_RE.match(line)
        if match:
            answers.append(match.group(1).upper())
    return answers


@router.post("/chat")
async def chat(user=Depends(authenticate), query: str = Body(..., embed=True)):
    if user["role"] != "Student":
        raise HTTPException(
            status_code=403,
            detail="Only students can ask questions",
        )

    query = query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    response = await answer_query(query, user["role"], user["grade"])

    chat_history_collection.insert_one(
        {
            "user_id": user["user_id"],
            "timestamp": _utc_now(),
            "query": query,
            "response": response["answer"],
            "sources": response["sources"],
        }
    )

    return response


@router.post("/quiz")
async def quiz(request: QuizRequest, user=Depends(authenticate)):
    if user["role"] != "Student":
        raise HTTPException(
            status_code=403,
            detail="Only students can generate quizzes",
        )

    response = await quiz_generation(
        request.topic.strip(),
        user["role"],
        user["grade"],
        request.num_questions or 3,
    )

    if response.get("error"):
        raise HTTPException(status_code=404, detail=response["error"])

    if not _extract_correct_answers(response["quiz"]):
        raise HTTPException(
            status_code=502,
            detail="The quiz came back in an unreadable format. Try again.",
        )

    quiz_doc = {
        "user_id": user["user_id"],
        "timestamp": _utc_now(),
        "topic": request.topic.strip(),
        "quiz_data": response["quiz"],
        "sources": response["sources"],
    }

    result = quizzes_collection.insert_one(quiz_doc)

    return {
        "quiz": response["quiz"],
        "sources": response["sources"],
        "quiz_id": str(result.inserted_id),
    }


@router.post("/quiz/check")
async def check_quiz_answers(request: QuizAnswerRequest, user=Depends(authenticate)):
    try:
        quiz_object_id = ObjectId(request.quiz_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid quiz id")

    quiz_doc = quizzes_collection.find_one({"_id": quiz_object_id})
    if not quiz_doc:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz_doc["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="This quiz belongs to another user")

    correct_answers = _extract_correct_answers(quiz_doc["quiz_data"])
    if not correct_answers:
        raise HTTPException(status_code=422, detail="This quiz has no gradable answers")

    if len(request.answers) != len(correct_answers):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Expected {len(correct_answers)} answers, "
                f"got {len(request.answers)}"
            ),
        )

    score = 0
    results = []

    for i, ans in enumerate(request.answers):
        given = ans.strip().upper()[:1]
        is_correct = given == correct_answers[i]
        if is_correct:
            score += 1

        results.append(
            {
                "question_number": i + 1,
                "user_answer": given,
                "correct_answer": correct_answers[i],
                "is_correct": is_correct,
            }
        )

    quiz_history.insert_one(
        {
            "user_id": user["user_id"],
            "quiz_id": request.quiz_id,
            "timestamp": _utc_now(),
            "topic": quiz_doc["topic"],
            "score": score,
            "total": len(correct_answers),
            "results": results,
            "quiz_content": quiz_doc["quiz_data"],
        }
    )

    return {
        "message": f"Quiz complete. You scored {score}/{len(correct_answers)}",
        "score": score,
        "total": len(correct_answers),
        "results": results,
    }


@router.get("/quiz/history")
async def get_quiz_history(user=Depends(authenticate)):
    if user["role"] != "Student":
        raise HTTPException(
            status_code=403,
            detail="Only students can view quiz history",
        )

    cursor = quiz_history.find({"user_id": user["user_id"]}).sort("timestamp", -1)

    history = []
    for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["quiz_id"] = str(doc["quiz_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()
        doc.pop("user_id", None)
        history.append(doc)

    return {"message": f"Found {len(history)} attempts", "history": history}
