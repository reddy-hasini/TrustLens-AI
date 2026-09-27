from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import (
    test_database_connection,
    insert_claim,
    get_all_claim_results,
    get_claim_result
)


app = FastAPI(
    title="TrustLens AI",
    description="Evidence-Aware Claim and Source Intelligence Platform",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimRequest(BaseModel):
    claim_text: str


@app.get("/")
def root():
    return {
        "message": "TrustLens AI backend is running"
    }


@app.get("/database-test")
def database_test():
    database_name = test_database_connection()

    return {
        "status": "connected",
        "database": database_name
    }


@app.post("/claims")
def create_claim(claim: ClaimRequest):
    claim_id = insert_claim(claim.claim_text)

    return {
        "message": "Claim stored successfully",
        "claim_id": claim_id,
        "claim_text": claim.claim_text
    }


# ============================================================
# STAGE 7 - CLAIM RESULTS API
# ============================================================

@app.get("/claims")
def get_claims():
    claims = get_all_claim_results()

    return {
        "count": len(claims),
        "claims": claims
    }


@app.get("/claims/{claim_id}")
def get_claim(claim_id: int):
    claim = get_claim_result(claim_id)

    if claim is None:
        raise HTTPException(
            status_code=404,
            detail="Claim not found"
        )

    return claim