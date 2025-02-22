from fastapi import HTTPException
from db.recipe import fetch_recipe, fetch_related, fetch_recipes
from ai_helpers import json_completion
from workflows.generate_recipe import generate_and_save_recipe
from workflows.update_recipe import update_recipe_and_save
from workflows.scrape_url import scrape_url_and_save
from fastapi import APIRouter
from exa_py import Exa
import os
from dotenv import load_dotenv
from my_types import RecipeRequest, UpdateRequest
import re

router = APIRouter()

load_dotenv()
exa = Exa(os.getenv("EXA_API_KEY"))

# Step 1: Scrape URL if it exists.  Can use regex.
# Step 2: Take the rest of the request into context - scrape, and then generate based on the rest of the prompt.
    # Surprisingly, we can still use regex for the first part of this!
    # Especially since we test for http/https, which will be in all copy/paste cases, but not any context people will type out by hand
    # For example, "I want to make a cake for my friend who works at expedia.com"
    # For the prompt, we can just add the recipe to it.  "The recipe referenced in the URL is: #{recipe_contents}"
    # Make sure to update the workflow to share steps + block URLs that aren't recipes
# Step 3: We do it based on LLM categorization.  Ask it to categorize the recipe.
    # For this use case, we don't actually need to do the LLM categorization, the regex works fine... but not everything is as easy to determine with regex as a URL.

# Now that we have the LLM doing categorization, we could do things like "I want the cake I had last week, but make it with apples instead of bananas".
# Then that goes to a third workflow that finds the recipe in our database, and then creates an updated version.
    # Of course, actually finding the right recipe and implementing that workflow is beyond the scope of this video
    # It's actually an interesting problem.  For the date range we'd likely want to generate some SQL.  For the rest we could do vector search with the contents of the recipe.
    # We'd also want to implement some further UI patterns, such as responding with a list of top recipe matches that it found, and asking the user to pick one before updating it
    # So maybe we'll do a video on that later.

# Something else we can do: updating preferences.  If the user types in anything like "I am gluten free" or "I am following a low-fat diet", then the LLM will send back a response of `{preferences: {gluten_free: true, dairy_free: true}}`
    # Then we'd update the preferences
    # note: we'd usually do that on the backend, but this app has the worst patterns for this and no user table lol, so we'd do it on the frontend)
# Another thing to note: affordances are important.  You might not always want a generic text input
# If you have dedicated UI elements, people can see that "oh, I can do that", instead of guessing
# Especially important if your app is not fully general-purpose.  You want to let people know what it can do!
# It could also be part of another workflow, generating the recipe and then updating preferences based on the recipe
# But in this case, you don't want the app changing things without the user being aware
# So, for example, if they're baking a cake for their gluten-free friend, you don't want to change their preferences to gluten-free permanently
# So if we actually implement this, then after the response we'd pop up a little options box that says "Do you want to update your preferences?" (assuming they're different than what we already have)
# But in the original case, where they user just types in "I am gluten free", the intent is clear and we can update our memory accordingly - although it's not clear how they would know that this prompt would do anything
# This UI pattern is called human-in-the-loop, by the way

# So we've generated ideas for two new videos:
# * Updating preferences with human-in-the-loop
# * Finding previous recipes with vector search and date queries

@router.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
      url = get_url_via_regex(request.recipeRequest)
      if url:
          db_recipe = await scrape_url_and_save(url=url, preferences=request.preferences, prompt=request.recipeRequest)
      else:
          db_recipe = await generate_and_save_recipe(request)
      # it would be better if this were run before using the preferences, so that we don't apply them unnecessarily (for example, saying gluten is okay)
      changes = preference_changes(request.recipeRequest)
      print("changes", changes)
      return {"recipe": db_recipe, "changes": changes}

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
        db_recipe = await update_recipe_and_save(request)
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

def preference_changes(string: str):
    return json_completion(f"""
      Return a json with the following key:
      - changes: [{{change_category: 'avoidOptions' | 'spiceLevels' | 'lifestyleOptions', change_key: string, value: boolean}}]

      The preferences that can be changed are:

      - avoidOptions: ["peanuts", "gluten", "dairy", "eggs", "fish", "shellfish", "seed oils","soy", "tree nuts", "alcohol", "caffeine", "sugar", "salt", "artificial sweeteners"]
      - spiceLevels: ["mild", "medium", "hot", "very hot"]
      - lifestyleOptions: ["vegan", "vegetarian", "halal", "kosher", "paleo", "keto", "low-carb", "low-fat"]

      Only mark it as changed if they specify a change to any of these categories.  It can be changing it to false, or changing it to true.

      The prompt is: {string}
    """)

def get_url_via_regex(string: str):
    url_pattern = re.compile(
        r'(?:https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)'
    )
    results = url_pattern.findall(string)
    if results:
        return results[0]
    else:
        return None
