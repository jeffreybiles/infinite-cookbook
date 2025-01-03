from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import uvicorn
import json
from exa_py import Exa

from db import fetch_children, fetch_recipes, fetch_recipe, init_db, add_to_db, Recipe, update_recipe as update_recipe_in_db

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeRequest(BaseModel):
    recipeRequest: str

class UpdateRequest(BaseModel):
    recipe_id: int
    preferences: str

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
exa = Exa(os.getenv("EXA_API_KEY"))

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
        f"Check if the following is a recipe that is used for cooking.  Return json {{is_recipe: boolean}}: {recipe}",
        model="llama-3.1-8b-instant"
        # This model has higher per-minute token limits, and also doesn't count against the 6k/minute limit on 3.3-70b-specdec
        # It doesn't need to be as advanced, it just needs to accurately check if it's a recipe
    )
    return response.get("is_recipe", False)

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

@app.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
        recipe_completion = completion(f"Generate a recipe for {request.recipeRequest}. Include ingredients and steps.")
        if not recipe_completion:
            raise HTTPException(status_code=400, detail="Failed to generate recipe")
        if not check_validity(recipe_completion):
            raise HTTPException(status_code=400, detail="The response was not a recipe.  Try a different prompt.")

        recipe_name = generate_name(recipe_completion)

        # Save to database
        db_recipe = Recipe(
            prompt=request.recipeRequest,
            content=recipe_completion,
            name=recipe_name,
        )
        await add_to_db(db_recipe)

        return {"recipe": db_recipe}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recipe")

@app.get("/recipes")
async def get_recipes():
    recipes = await fetch_recipes()
    return {"recipes": recipes}

@app.post("/update")
async def update_recipe(request: UpdateRequest):
    try:
        old_recipe = await fetch_recipe(request.recipe_id)
        if not old_recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")

        updated_recipe_completion = completion(f"Update the recipe for {old_recipe.content} to include the following preferences: {request.preferences}")

        if not updated_recipe_completion:
            raise HTTPException(status_code=400, detail="Failed to update recipe")

        if not check_validity(updated_recipe_completion):
            raise HTTPException(status_code=400, detail="The response was not a recipe.  Try a different prompt.")

        recipe_name = generate_name(updated_recipe_completion)

        db_recipe = Recipe(
            parent_id=request.recipe_id,
            content=updated_recipe_completion,
            prompt=request.preferences,
            name=recipe_name,
        )
        await add_to_db(db_recipe)
        old_recipe.is_latest = False # type: ignore
        await update_recipe_in_db(old_recipe)

        return {"recipe": db_recipe}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update recipe")

@app.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    print(f"Fetching recipe with id: {recipe_id}")
    recipe = await fetch_recipe(int(recipe_id))
    parent = await fetch_recipe(recipe.parent_id) if recipe.parent_id else None # type: ignore
    children = await fetch_children(int(recipe_id))
    return {"recipe": recipe, "children": children}

@app.get("/recipe/{recipe_id}/suggestions")
async def get_suggestions(recipe_id: str, previous: str = ""):
    previous_changes = previous.split(',')
    recipe = await fetch_recipe(int(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    suggestions = json_completion(f"""
        Return a json array of 4 possible changes or improvements, in the format {{suggestions: [{{change: string, explanation: string}}]}}

        The changes should be just 2-3 words, and the following are not repeated: {previous_changes}

        Make the changes to the following recipe: {recipe.content}
    """)
    return suggestions

@app.get("/dish-ideas")
async def get_dish_ideas(current: str = ""):
    dish_ideas = json_completion(f"Return a json array of 12 dish ideas, in the format {{dish_ideas: [string]}}.  The dish ideas should not contain the following: {current}")
    return dish_ideas

@app.get("/scrape")
async def scrape_from_url(url: str):
    try:
        results = exa.get_contents(
            [url],
            text=True
        )
        result = results.results[0].text
        if not result:
            raise HTTPException(status_code=400, detail="Failed to fetch URL")

        recipe_completion = completion(f"""
            Extract the recipe from this HTML content and format it nicely with ingredients and instructions.
            Return just the formatted recipe text, without any stories or filler.  Do not say that it is reformatted, but do list {url} as the source.

            {result}
        """)

        recipe_name = generate_name(recipe_completion)

        db_recipe = Recipe(
            content=recipe_completion,
            prompt=f"Scraped from {url}",
            name=recipe_name
        )
        await add_to_db(db_recipe)

        return {"recipe": db_recipe}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to scrape recipe from URL")

@app.on_event("startup")
async def startup():
    await init_db()

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)