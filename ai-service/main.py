import base64
import json
import os
from pathlib import Path

import anthropic
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

# Load root .env so ANTHROPIC_API_KEY works in local dev.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="Flowgenix Lite AI Service")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
AI_PROVIDER = os.environ.get("AI_PROVIDER", "").strip().lower()

if not AI_PROVIDER:
    AI_PROVIDER = "gemini" if GEMINI_API_KEY else "anthropic"

anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
gemini_client = None

if AI_PROVIDER == "gemini":
    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise RuntimeError("Gemini provider selected but google-generativeai is not installed") from exc
    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini provider selected but GEMINI_API_KEY is missing")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_client = genai

EXTRACT_MODEL = os.environ.get(
    "ANTHROPIC_MODEL" if AI_PROVIDER == "anthropic" else "GEMINI_MODEL",
    "claude-sonnet-4-20250514" if AI_PROVIDER == "anthropic" else "gemini-2.5-flash",
)
QA_MODEL = os.environ.get(
    "ANTHROPIC_QA_MODEL" if AI_PROVIDER == "anthropic" else "GEMINI_QA_MODEL",
    EXTRACT_MODEL,
)

EXTRACT_PROMPT = """You are a document intelligence AI for Indian personal documents.
Analyze this document and return a JSON object with these exact keys:
{
  "documentType": string,
  "category": string,
  "holderName": string,
  "issuedDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null",
  "keyFields": object,
  "summary": string,
  "confidence": number
}

category must be one of: identity, finance, property, insurance, legal, vehicle, medical, other
documentType examples: Aadhaar Card, PAN Card, Car Insurance Policy, Rent Agreement
Return ONLY valid JSON, no markdown, no explanation."""


class ExtractRequest(BaseModel):
    file_url: str
    mime_type: str


class QARequest(BaseModel):
    doc_summary: str
    key_fields: dict
    question: str


async def download_file(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=60.0) as http:
        response = await http.get(url)
        response.raise_for_status()
        return response.content


def build_message_content(file_bytes: bytes, mime_type: str) -> list:
    if mime_type == "application/pdf":
        # Claude accepts PDF as document type in newer API; fallback to text hint if needed
        b64 = base64.b64encode(file_bytes).decode()
        return [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": b64,
                },
            },
            {"type": "text", "text": EXTRACT_PROMPT},
        ]

    b64 = base64.b64encode(file_bytes).decode()
    media_type = mime_type if mime_type.startswith("image/") else "image/jpeg"
    return [
        {
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": b64},
        },
        {"type": "text", "text": EXTRACT_PROMPT},
    ]


def extract_json_text(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned)


def run_extract_with_anthropic(file_bytes: bytes, mime_type: str) -> dict:
    if not anthropic_client:
        raise RuntimeError("ANTHROPIC_API_KEY is missing for anthropic provider")
    content = build_message_content(file_bytes, mime_type)
    response = anthropic_client.messages.create(
        model=EXTRACT_MODEL,
        max_tokens=1000,
        messages=[{"role": "user", "content": content}],
    )
    return extract_json_text(response.content[0].text)


def run_extract_with_gemini(file_bytes: bytes, mime_type: str) -> dict:
    model_name = EXTRACT_MODEL.replace("models/", "", 1)
    model = gemini_client.GenerativeModel(model_name)
    prompt_part = {"text": EXTRACT_PROMPT}
    file_part = {
        "inline_data": {
            "mime_type": mime_type if mime_type.startswith("image/") or mime_type == "application/pdf" else "image/jpeg",
            "data": base64.b64encode(file_bytes).decode(),
        }
    }
    result = model.generate_content([prompt_part, file_part])
    return extract_json_text(result.text)


def run_qa_with_anthropic(context: str, question: str) -> str:
    if not anthropic_client:
        raise RuntimeError("ANTHROPIC_API_KEY is missing for anthropic provider")
    response = anthropic_client.messages.create(
        model=QA_MODEL,
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": f"Based on this document:\n{context}\n\nQuestion: {question}\nAnswer concisely.",
            }
        ],
    )
    return response.content[0].text


def run_qa_with_gemini(context: str, question: str) -> str:
    model_name = QA_MODEL.replace("models/", "", 1)
    model = gemini_client.GenerativeModel(model_name)
    result = model.generate_content(
        f"Based on this document:\n{context}\n\nQuestion: {question}\nAnswer concisely."
    )
    return result.text


@app.get("/health")
async def health():
    return {"status": "ok", "service": "flowgenix-lite-ai", "provider": AI_PROVIDER, "model": EXTRACT_MODEL}


@app.post("/ai/extract")
async def extract_document(body: ExtractRequest):
    file_bytes = await download_file(body.file_url)
    if AI_PROVIDER == "gemini":
        return run_extract_with_gemini(file_bytes, body.mime_type)
    return run_extract_with_anthropic(file_bytes, body.mime_type)


@app.post("/ai/qa")
async def answer_question(body: QARequest):
    context = f"Document Summary: {body.doc_summary}\nKey Fields: {json.dumps(body.key_fields)}"
    if AI_PROVIDER == "gemini":
        return {"answer": run_qa_with_gemini(context, body.question)}
    return {"answer": run_qa_with_anthropic(context, body.question)}
