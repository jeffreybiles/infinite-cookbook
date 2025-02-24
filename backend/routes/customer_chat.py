from fastapi import APIRouter, Request
from ai_helpers import json_completion

router = APIRouter()

@router.post("/classify-customer-chat")
async def classify_customer_chat(request: Request):
    data = await request.json()
    text = data.get("text")
    category = json_completion(f"""
      Classify the following customer chat into one of the following categories:
      - Billing
      - New Customer
      - Report an Issue

      Return a json with the following key:
      - category: Billing | New Customer | Report an Issue

      If the customer is asking about the capabilities of the app, return "New Customer".
      If the customer is asking about the pricing, return "New Customer", but all other monetary questions should be 'billing'.

      The customer chat is: {text}
    """)
    return category
