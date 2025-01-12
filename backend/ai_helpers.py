import json
from fastapi import HTTPException
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def completion(prompt: str, model: str = "llama3-8b-8192", return_json: bool = False) -> str:
    response = groq_client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        model=model,
        response_format={"type": "json_object"} if return_json else None
    )

    return response.choices[0].message.content or ''

def json_completion(prompt: str, model: str = "llama3-8b-8192", max_retries: int = 3) -> dict:
    for attempt in range(max_retries):
        try:
            content = completion(prompt, model, return_json=True)
            return json.loads(content)
        except json.JSONDecodeError as e:
            if attempt == max_retries - 1:  # Last attempt
                print(f"Failed to parse JSON after {max_retries} attempts. Last error: {str(e)}")
                return {}
            print(f"Attempt {attempt + 1} failed, retrying...")
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return {}
    raise HTTPException(status_code=500, detail="Failed to create JSON")

def check_validity(recipe: str):
    response = json_completion(
        f"""Check if the following is in a recipe format, and is a valid food dish that can be served.
        Return json {{is_recipe: boolean, is_food: boolean}}

        {recipe}
        """,
        model="llama-3.1-8b-instant"
    )
    return response.get("is_recipe", False) and response.get("is_food", False)

def generate_name(recipe: str):
    response = json_completion(
        f"""You must return a valid JSON object with exactly this format: {{"name": "Recipe Name Here"}}

        Generate a short, descriptive name for this recipe: {recipe}

        Requirements:
        - Do not include the word "updated"
        - The response must be a valid JSON object
        - The name should be concise (3-6 words)""",
        model="llama-3.1-8b-instant",
    )
    return response.get("name", "")

