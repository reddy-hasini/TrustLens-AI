import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def test_database_connection():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database();")
        )

        database_name = result.scalar()

        return database_name


def insert_claim(claim_text):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                INSERT INTO claims (claim_text)
                VALUES (:claim_text)
                RETURNING claim_id;
            """),
            {
                "claim_text": claim_text
            }
        )

        claim_id = result.scalar()
        connection.commit()

        return claim_id


def insert_source(url, title, domain, source_type=None):
    with engine.connect() as connection:

        existing = connection.execute(
            text("""
                SELECT source_id
                FROM sources
                WHERE url = :url
                LIMIT 1;
            """),
            {
                "url": url
            }
        ).scalar()

        if existing:
            return existing

        result = connection.execute(
            text("""
                INSERT INTO sources
                (
                    url,
                    title,
                    domain,
                    source_type
                )
                VALUES
                (
                    :url,
                    :title,
                    :domain,
                    :source_type
                )
                RETURNING source_id;
            """),
            {
                "url": url,
                "title": title,
                "domain": domain,
                "source_type": source_type
            }
        )

        source_id = result.scalar()
        connection.commit()

        return source_id


def insert_evidence(
    claim_id,
    source_id,
    evidence_text,
    evidence_type="search_snippet",
    relevance_score=None,
    stance=None
):
    with engine.connect() as connection:

        existing = connection.execute(
            text("""
                SELECT evidence_id
                FROM evidence
                WHERE claim_id = :claim_id
                AND source_id = :source_id
                AND evidence_text = :evidence_text
                LIMIT 1;
            """),
            {
                "claim_id": claim_id,
                "source_id": source_id,
                "evidence_text": evidence_text
            }
        ).scalar()

        if existing:
            return existing

        result = connection.execute(
            text("""
                INSERT INTO evidence
                (
                    claim_id,
                    source_id,
                    evidence_text,
                    evidence_type,
                    relevance_score,
                    stance
                )
                VALUES
                (
                    :claim_id,
                    :source_id,
                    :evidence_text,
                    :evidence_type,
                    :relevance_score,
                    :stance
                )
                RETURNING evidence_id;
            """),
            {
                "claim_id": claim_id,
                "source_id": source_id,
                "evidence_text": evidence_text,
                "evidence_type": evidence_type,
                "relevance_score": relevance_score,
                "stance": stance
            }
        )

        evidence_id = result.scalar()
        connection.commit()

        return evidence_id


# ============================================================
# STAGE 7 - TRUSTLENS CLAIM RESULTS
# ============================================================

def get_all_claim_results():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    claim_id,
                    claim_text,
                    supporting_score,
                    contradicting_score,
                    neutral_count,
                    total_evidence,
                    net_evidence_score,
                    evidence_balance,
                    evidence_status,
                    verdict,
                    confidence_score,
                    explanation,
                    claim_status
                FROM trustlens_final_result
                ORDER BY claim_id;
            """)
        )

        return [dict(row._mapping) for row in result]


def get_claim_result(claim_id):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    claim_id,
                    claim_text,
                    supporting_score,
                    contradicting_score,
                    neutral_count,
                    total_evidence,
                    net_evidence_score,
                    evidence_balance,
                    evidence_status,
                    verdict,
                    confidence_score,
                    explanation,
                    claim_status
                FROM trustlens_final_result
                WHERE claim_id = :claim_id;
            """),
            {
                "claim_id": claim_id
            }
        )

        row = result.fetchone()

        if row is None:
            return None

        return dict(row._mapping)