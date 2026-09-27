from ddgs import DDGS
from urllib.parse import urlparse

from backend.app.database import insert_source, insert_evidence


def search_sources(query, max_results=5):
    results = []

    with DDGS() as ddgs:
        search_results = ddgs.text(
            query,
            max_results=max_results
        )

        for result in search_results:
            url = result.get("href")
            title = result.get("title")
            snippet = result.get("body")

            domain = urlparse(url).netloc if url else None

            results.append({
                "title": title,
                "url": url,
                "snippet": snippet,
                "domain": domain
            })

    return results


def ingest_sources(claim_id, query, max_results=5):
    search_results = search_sources(
        query,
        max_results=max_results
    )

    stored_sources = []

    for result in search_results:
        source_id = insert_source(
            url=result["url"],
            title=result["title"],
            domain=result["domain"],
            source_type=None
        )

        evidence_id = insert_evidence(
            claim_id=claim_id,
            source_id=source_id,
            evidence_text=result["snippet"],
            evidence_type="search_snippet"
        )

        stored_sources.append({
            "source_id": source_id,
            "evidence_id": evidence_id,
            "claim_id": claim_id,
            "title": result["title"],
            "url": result["url"],
            "domain": result["domain"],
            "snippet": result["snippet"]
        })

    return stored_sources