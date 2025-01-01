from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import uvicorn

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

        recipe = recipe_completion.choices[0].message.content

        return {"recipe": recipe}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recipe")

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

if __name__ == "__main__":
    print("Starting server")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)