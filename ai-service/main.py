import base64
import json
import os
from io import BytesIO

import anthropic
import httpx
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Flowgenix Lite AI Service")
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

EXTRACT_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
QA_MODEL = os.environ.get("ANTHROPIC_QA_MODEL", EXTRACT_MODEL)

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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "flowgenix-lite-ai"}


@app.post("/ai/extract")
async def extract_document(body: ExtractRequest):
    file_bytes = await download_file(body.file_url)
    content = build_message_content(file_bytes, body.mime_type)

    response = client.messages.create(
        model=EXTRACT_MODEL,
        max_tokens=1000,
        messages=[{"role": "user", "content": content}],
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


@app.post("/ai/qa")
async def answer_question(body: QARequest):
    context = f"Document Summary: {body.doc_summary}\nKey Fields: {json.dumps(body.key_fields)}"
    response = client.messages.create(
        model=QA_MODEL,
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": f"Based on this document:\n{context}\n\nQuestion: {body.question}\nAnswer concisely.",
            }
        ],
    )
    return {"answer": response.content[0].text}
