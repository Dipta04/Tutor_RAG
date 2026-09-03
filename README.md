# TutorRAG

A retrieval-augmented tutor. Teachers upload PDFs; students ask questions and take
quizzes generated from that material.

- `server/` — FastAPI, MongoDB, Pinecone, Groq (unchanged in structure from the original project)
- `client/` — Next.js 15 (App Router, TypeScript, Tailwind CSS), replacing the Streamlit app

## Before you run anything: rotate your API keys

The `.env` in the original project contained live MongoDB, Google, Pinecone and Groq
credentials, and `.gitignore` did not exclude it. Treat all four as compromised and
rotate them, then change the MongoDB user's password. This repository ships
`.env.example` files only.

## Architecture

The browser never sees your credentials or talks to FastAPI directly.

```
browser ──► Next.js route handlers (/api/*) ──► FastAPI (:8000)
             reads httpOnly session cookie
             adds the HTTP Basic header
```

Two httpOnly cookies are set on sign-in:

| Cookie | Contents |
| --- | --- |
| `tutorrag_auth` | `username:password`, base64url encoded, used to build the Basic header |
| `tutorrag_user` | the profile the UI displays (name, role, grade) |

Because the proxy runs server-side, no CORS configuration is needed on FastAPI.

Note the trade-off: HTTP Basic requires the reusable password on every request, so the
cookie holds credentials rather than a revocable token. An httpOnly cookie keeps it out
of reach of page JavaScript, but if you plan to run this beyond coursework, move the
backend to short-lived JWTs or server-side sessions. Always serve over HTTPS in
production — the cookie's `secure` flag is set automatically when `NODE_ENV=production`.

## Running it

### 1. Server

```bash
cd server
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your rotated keys
uvicorn main:app --reload --port 8000
```

Requires a Pinecone index whose dimension matches `models/gemini-embedding-001`.
Create it once before uploading documents.

### 2. Client

```bash
cd client
npm install
cp .env.example .env.local  # BACKEND_URL, defaults to http://127.0.0.1:8000
npm run dev                 # http://localhost:3000
```

For production: `npm run build && npm start`.

## What each screen does

| Route | Role | Behaviour |
| --- | --- | --- |
| `/` | guest | Marketing page: starfield hero, product previews, author card |
| `/login`, `/signup` | guest | Spectrum-bordered card; username and password, plus a Google button |
| `/privacy`, `/terms`, `/cookies` | anyone | Placeholder policy pages linked from the sign-in card |
| `/chat` | student | Threaded chat, source chips, markdown answers, local chat history |
| `/quiz` | student | Generate, answer and submit a multiple-choice quiz |
| `/history` | student | Past attempts with the options you chose and the correct ones |
| `/documents` | teacher | Upload a PDF and index it for a chosen grade |

Chat threads are kept in the browser's `localStorage`, keyed per username, because the
API stores chat history but exposes no endpoint to read it back. Adding
`GET /chat/history` on the server would let the sidebar sync across devices.

## Google sign-in

The button is in the UI. It is switched off until you configure it, and while it
is off it explains that rather than failing silently.

**This path has not been tested end to end** — that needs real Google credentials
and a live MongoDB. Read the code before you trust it in front of students.

### Why it needs new server code

Every API call authenticates with HTTP Basic, which re-sends the username and
password each time. A Google account has no password, so there is nothing to put in
the header. `server/auth/google_route.py` closes that gap without changing the rest
of the API: the first time somebody signs in with Google it generates a random
password, stores the bcrypt hash, and hands the plaintext back to the Next.js
server, which keeps it in the same httpOnly cookie as any other sign-in.

Accounts created with a username and password are refused a Google link and get a
409, because rotating their password would lock them out of the form they already use.

### Enabling it

1. In Google Cloud, create an OAuth 2.0 Web application client and add
   `http://localhost:3000/api/auth/google/callback` as an authorised redirect URI.
2. Generate a shared secret, for example `openssl rand -hex 32`.
3. `server/.env` — set `INTERNAL_API_KEY` to that secret.
4. `server/main.py` — include the router:

   ```python
   from auth.google_route import router as google_router
   app.include_router(google_router)
   ```

5. `client/.env.local` — set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REDIRECT_URI` and the same `INTERNAL_API_KEY`.

The flow is entirely server-side: `/api/auth/google` redirects to Google with a
state cookie, and `/api/auth/google/callback` exchanges the code, reads the ID
token, calls the FastAPI endpoint and creates the session. The ID token's signature
is not re-verified because it arrives directly from Google's token endpoint over a
server-to-server TLS call, which Google documents as a trusted channel. If you ever
accept an ID token from the browser instead, verify it against Google's JWKS first.

New accounts land on grade 1, since Google does not know a student's grade. Add a
grade picker after first sign-in, or set it manually in MongoDB.

## The landing page

Built from the structure you referenced: sticky nav, starfield hero with a light
beam and two highlighted words, product previews, author card, a data table
preview, and a footer.

The device previews are real markup, not screenshots, so they restyle with the
theme and never go stale. The starfield uses a seeded generator rather than
`Math.random`, so the server and browser produce identical markup and React does
not report a hydration mismatch.

Your photo is at `client/public/author.jpg`, resized to 800px and rendered in
grayscale to match the reference treatment.

**The testimonial slot is empty on purpose.** The page you referenced quotes a named
teacher at a named college. Writing a fake one under a real-sounding name and
institution would be inventing an endorsement, so I left it out. Add a real quote
with permission when you have one.

The policy pages exist so the sign-in links do not 404, but they hold no policy
text. Write them against what your deployment actually does with student data, and
have someone qualified review it, before you share this with a class.

## Changes made to the server

The structure, packages and endpoint contracts are unchanged. These are the fixes:

1. **`chat/route.py` — `details=` → `detail=`.** `HTTPException` has no `details`
   keyword, so a non-student calling `/chat` or `/quiz` raised `TypeError` and returned
   500 instead of 403.
2. **`docs/vectorstore.py` — Pinecone IDs.** `f"{doc_id}{-i}"` evaluated `-i`, producing
   `doc_id0`, `doc_id-1`, `doc_id-2`. MongoDB stored `doc_id-0`, `doc_id-1`. The first
   chunk of every document could never be retrieved. Now both use `f"{doc_id}-{i}"`.
3. **`docs/vectorstore.py` — success log.** The `print` referenced `file` after the loop,
   which raises `NameError` on an empty list. Moved inside the loop.
4. **`auth/route.py` — `/login` response.** It returned only a message and role, so the
   client had no name or grade to display. It now returns username, fullname, role and grade.
5. **`chat/route.py` — answer-key parsing.** `line.split(":")[1]` failed on
   `**Correct Answer:** B`, silently producing zero answers and a confusing
   "Answer count mismatch". Replaced with a regex that tolerates markdown and dash
   separators, and `/quiz` now rejects an ungradable quiz at generation time.
6. **`chat/route.py` — invalid quiz IDs.** A malformed `quiz_id` raised `InvalidId` and
   returned 500; it now returns 400.
7. **`datetime.utcnow()` → `datetime.now(timezone.utc)`** (deprecated in Python 3.12+),
   and timestamps are serialised to ISO strings in `/quiz/history` so JSON encoding is explicit.
8. **Uploads.** Filenames are stripped of directory components before being written to
   `upload_docs/`, empty and oversized files are rejected, PDFs with no extractable text
   return 422 rather than 500, and vectors are upserted in batches of 100.
9. **`config/db.py`** raises a clear error when `MONGO_URI` is missing instead of failing
   deep inside pymongo.
10. **Validation.** Pydantic models now constrain lengths, email shape and grade range.
    `pyproject.toml` lost its `[project.scripts]` entry, which pointed at a `tutor_rag`
    module that does not exist.

Signup previously failed from the Streamlit client, which sent `fullName` and `userName`
while the API expects `fullname` and `username`. The Next.js client sends the correct keys.

## Recommended next step, not applied

`POST /upload_docs` has no authentication — anyone who can reach the server can add
documents to a grade's knowledge base. The client blocks non-teachers, but that is only a
client-side guard. To close it on the server:

```python
from auth.route import authenticate

@router.post("/upload_docs")
async def upload_docs(
    file: UploadFile = File(...),
    grade: int = Form(...),
    user=Depends(authenticate),
):
    if user["role"] != "Teacher":
        raise HTTPException(status_code=403, detail="Only teachers can upload documents")
```

The client already sends credentials with the upload, so nothing else needs to change.

## Known limits

- Quiz grading depends on the model emitting `Correct Answer: X` on its own line. The
  parser tolerates markdown and dash separators, but a model that writes the key in prose
  ("the correct answer is A") will not be graded; `/quiz` returns 502 rather than saving
  an ungradable quiz.
- Documents are indexed with `role: "Public"`, so grade is the only access boundary.
- Uploads are capped at 25 MB in both the route handler and the API.
- Retrieval uses a fixed `top_k` of 5.
- Google sign-in is written but untested, and disabled unless all four environment
  variables are set.
- `/login` and `/signup` are rendered per request so the Google keys can change
  without a rebuild.
