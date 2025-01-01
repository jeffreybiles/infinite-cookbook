from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from openai import OpenAI
import os
from dotenv import load_dotenv
import uvicorn

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
def completion(prompt: str, model: str = "llama-3.3-70b-specdec"):
    return groq_client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        model=model
    )

@app.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
        recipe_completion = completion(f"Generate a recipe for {request.recipeRequest}. Include ingredients and steps.")

        recipe_content = recipe_completion.choices[0].message.content

        # Save to database
        db_recipe = Recipe(
            prompt=request.recipeRequest,
            content=recipe_content,
        )
        await add_to_db(db_recipe)

        return {"recipe": db_recipe}

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

        updated_recipe = updated_recipe_completion.choices[0].message.content
        if not updated_recipe:
            raise HTTPException(status_code=400, detail="Failed to update recipe")

        db_recipe = Recipe(
            parent_id=request.recipe_id,
            content=updated_recipe,
            prompt=request.preferences,
        )
        await add_to_db(db_recipe)
        old_recipe.is_latest = False # type: ignore
        await update_recipe_in_db(old_recipe)

        return {"recipe": db_recipe}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update recipe")

@app.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    print(f"Fetching recipe with id: {recipe_id}")
    recipe = await fetch_recipe(int(recipe_id))
    parent = await fetch_recipe(recipe.parent_id) if recipe.parent_id else None # type: ignore
    children = await fetch_children(int(recipe_id))
    return {"recipe": recipe, "parent": parent, "children": children}

@app.on_event("startup")
async def startup():
    await init_db()

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)