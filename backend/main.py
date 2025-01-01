from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from openai import OpenAI
import os
from dotenv import load_dotenv
import uvicorn

from db import fetch_recipes, fetch_recipe, init_db, add_to_db, Recipe

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
    recipe: str
    preferences: str

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

@app.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
        recipe_completion = openai_client.chat.completions.create(
            messages=[
                {"role": "user", "content": f"Generate a recipe for {request.recipeRequest}. Include ingredients and steps."}
            ],
            model="gpt-4"
        )

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
        updated_recipe_completion = openai_client.chat.completions.create(
            messages=[
                {"role": "user", "content": f"Update the recipe for {request.recipe} to include the following preferences: {request.preferences}"}
            ],
            model="gpt-4"
        )

        updated_recipe = updated_recipe_completion.choices[0].message.content

        return {"updatedRecipe": updated_recipe}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update recipe")

@app.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    print(f"Fetching recipe with id: {recipe_id}")
    recipe = await fetch_recipe(int(recipe_id))
    return {"recipe": recipe }

@app.on_event("startup")
async def startup():
    await init_db()

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)