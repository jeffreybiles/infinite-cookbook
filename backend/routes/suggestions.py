from fastapi import HTTPException
from db.recipe import fetch_recipe, Recipe, add_to_db
from ai_helpers import json_completion, completion, generate_name
from fastapi import APIRouter
from exa_py import Exa
import os
from dotenv import load_dotenv

router = APIRouter()

load_dotenv()

exa = Exa(os.getenv("EXA_API_KEY"))

@router.get("/recipe/{recipe_id}/suggestions")
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

@router.get("/dish-ideas")
async def get_dish_ideas(current: str = ""):
    dish_ideas = json_completion(f"Return a json array of 12 dish ideas, in the format {{dish_ideas: [string]}}.  The dish ideas should not contain the following: {current}")
    return dish_ideas

@router.get("/scrape")
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
