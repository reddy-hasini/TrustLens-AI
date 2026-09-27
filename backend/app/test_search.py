from backend.app.search import search_sources


results = search_sources(
    "electric vehicles lifetime carbon emissions petrol cars",
    max_results=5
)

for result in results:
    print("\nTITLE:", result["title"])
    print("URL:", result["url"])
    print("SNIPPET:", result["snippet"])