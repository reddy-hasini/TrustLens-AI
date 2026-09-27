from db import get_connection


claim_text = input("Enter a claim: ")

connection = get_connection()
cursor = connection.cursor()

cursor.execute(
    """
    INSERT INTO claims (claim_text, status)
    VALUES (%s, %s)
    RETURNING claim_id;
    """,
    (claim_text, "pending")
)

claim_id = cursor.fetchone()[0]

connection.commit()

cursor.close()
connection.close()

print(f"\nClaim added successfully!")
print(f"Claim ID: {claim_id}")
print(f"Status: pending")