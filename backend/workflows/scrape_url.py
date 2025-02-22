from prompts import preferences_prompt
from my_types import Preferences
from ai_helpers import completion, json_completion
from fastapi import HTTPException
from exa_py import Exa
import os
from dotenv import load_dotenv
from workflows.generate_recipe import save_to_db

load_dotenv()
exa = Exa(os.getenv("EXA_API_KEY"))

async def scrape_url_and_save(url: str, preferences: Preferences, prompt: str):
  recipe_completion = scrape_and_extract(url)
  recipe_with_preferences = update_with_preferences(url, preferences, recipe_completion)
  if has_further_instructions(prompt):
    recipe_with_further_instructions = completion(f"""
      Apply the following instructions to a recipe.  The recipe was found from the URL in the prompt ({url}).

      Remember to include the URL as a the source, but say that you modified it to fit my saved preferences and custom instructions.

      Instructions: {prompt}

      Recipe: {recipe_with_preferences}
    """)
    print("recipe_with_further_instructions", recipe_with_further_instructions)
    db_recipe = await save_to_db(recipe_with_further_instructions, prompt)
  else:
    print("recipe with no further instructions", recipe_with_preferences)
    db_recipe = await save_to_db(recipe_with_preferences, prompt)
  return db_recipe

def has_further_instructions(prompt: str):
  result = json_completion(f"""
    I want to check if the following prompt requests any modifications to the recipe found at the URL.

    {prompt}

    Return json with the following key:
    - has_further_instructions: boolean
  """)
  print("has_further_instructions", result)
  return result["has_further_instructions"]


def update_with_preferences(url: str, preferences: Preferences, recipe_completion: str):
  return completion(f"""
    I have the following preferences:

    {preferences_prompt(preferences)}

    Please update the following recipe:
    {recipe_completion}

    Remember to include the url as the source: {url}, but say that you modified it to fit my preferences.
    """)


def scrape_and_extract(url: str):
  results = exa.get_contents(
      [url],
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
  return recipe_completion
