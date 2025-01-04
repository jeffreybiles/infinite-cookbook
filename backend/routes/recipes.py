from fastapi import HTTPException
from db.recipe import Recipe, add_to_db, fetch_recipe, fetch_related, fetch_recipes, update_recipe as update_recipe_in_db
from ai_helpers import completion, check_validity, generate_name
from pydantic import BaseModel
from fastapi import APIRouter
from exa_py import Exa
import os
from dotenv import load_dotenv
from typing_extensions import List, Optional, TypedDict

router = APIRouter()

load_dotenv()
exa = Exa(os.getenv("EXA_API_KEY"))

class Preferences(TypedDict):
    avoid: List[str]
    lifestyle: List[str]
    spiceLevel: Optional[str]
    custom: str

class RecipeRequest(BaseModel):
    recipeRequest: str
    preferences: Preferences

class UpdateRequest(BaseModel):
    recipe_id: int
    modifications: str
    preferences: Preferences

class ScrapeRequest(BaseModel):
    url: str
    preferences: Preferences

from typing import List, Optional, TypedDict



def preferences_prompt(preferences: Preferences):
    string = ""
    if preferences["avoid"]:
        string += f"Avoid the following ingredients: {', '.join(preferences['avoid'])}\n"
    if preferences["lifestyle"]:
        string += f"Follow the following lifestyle: {', '.join(preferences['lifestyle'])}\n"
    if preferences["spiceLevel"]:
        string += f"Have the following spice level, if applicable, to this recipe (ignore if dish does not require spice): {preferences['spiceLevel']}\n"
    if preferences["custom"]:
        string += f"Also keep the following in mind, if applicable: {preferences['custom']}\n"
    return string

@router.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
        recipe_completion = completion(f"""Generate a recipe for {request.recipeRequest}. Include ingredients and steps.

        {preferences_prompt(request.preferences)}
        """)
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
        db_recipe.original_id = db_recipe.id
        await update_recipe_in_db(db_recipe)

        return {"recipe": db_recipe}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recipe")


@router.get("/recipes")
async def get_recipes():
    recipes = await fetch_recipes()
    return {"recipes": recipes}

@router.post("/update")
async def update_recipe(request: UpdateRequest):
    try:
        old_recipe = await fetch_recipe(request.recipe_id)
        if not old_recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")

        updated_recipe_completion = completion(f"""Update the recipe for {old_recipe.content} to include the following modifications:

        {request.modifications}

        Remember my other preferences:{preferences_prompt(request.preferences)}
        """)

        if not updated_recipe_completion:
            raise HTTPException(status_code=400, detail="Failed to update recipe")

        if not check_validity(updated_recipe_completion):
            raise HTTPException(status_code=400, detail="The response was not a recipe.  Try a different prompt.")

        recipe_name = generate_name(updated_recipe_completion)

        db_recipe = Recipe(
            parent_id=request.recipe_id,
            content=updated_recipe_completion,
            prompt=request.modifications,
            name=recipe_name,
            original_id=old_recipe.original_id,
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

@router.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    print(f"Fetching recipe with id: {recipe_id}")
    recipe = await fetch_recipe(int(recipe_id))
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    related = await fetch_related(recipe)
    return {"recipe": recipe, "related": related}

@router.post("/scrape")
async def scrape_from_url(request: ScrapeRequest):
    try:
        results = exa.get_contents(
            [request.url],
            text=True
        )
        result = results.results[0].text
        if not result:
            raise HTTPException(status_code=400, detail="Failed to fetch URL")

        recipe_completion = completion(f"""
            Extract the recipe from this HTML content and format it nicely with ingredients and instructions.
            Return just the formatted recipe text, without any stories or filler.  Do not say that it is reformatted.

            {result}
        """)

        recipe_with_preferences = completion(f"""
        I have the following preferences:

        {preferences_prompt(request.preferences)}

        Please update the following recipe:
        {recipe_completion}

        Remember to include the url as the source: {request.url}, but say that you modified it to fit my preferences.
        """)

        recipe_name = generate_name(recipe_with_preferences)

        db_recipe = Recipe(
            content=recipe_with_preferences,
            prompt=f"Scraped from {request.url}",
            name=recipe_name
        )
        await add_to_db(db_recipe)
        db_recipe.original_id = db_recipe.id
        await update_recipe_in_db(db_recipe)

        return {"recipe": db_recipe}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to scrape recipe from URL")
