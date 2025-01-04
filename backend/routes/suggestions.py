from fastapi import HTTPException
from db.recipe import fetch_recipe, Recipe, add_to_db
from ai_helpers import json_completion, completion, generate_name
from fastapi import APIRouter

router = APIRouter()

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