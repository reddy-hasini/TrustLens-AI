from backend.app.search import ingest_sources


results = ingest_sources(
    claim_id=1,
    query="electric vehicles lifetime carbon emissions petrol cars",
    max_results=5
)

for result in results:
    print("\nSOURCE ID:", result["source_id"])
    print("TITLE:", result["title"])
    print("DOMAIN:", result["domain"])
    print("URL:", result["url"])