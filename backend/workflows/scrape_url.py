from db.recipe import Recipe, add_to_db, update_recipe as update_recipe_in_db
from prompts import preferences_prompt
from my_types import Preferences
from ai_helpers import completion, generate_name
from fastapi import HTTPException
from exa_py import Exa
import os
from dotenv import load_dotenv

load_dotenv()
exa = Exa(os.getenv("EXA_API_KEY"))

async def scrape_url_and_save(url: str, preferences: Preferences):
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

  recipe_with_preferences = completion(f"""
  I have the following preferences:

  {preferences_prompt(preferences)}

  Please update the following recipe:
  {recipe_completion}

  Remember to include the url as the source: {url}, but say that you modified it to fit my preferences.
  """)

  recipe_name = generate_name(recipe_with_preferences)

  db_recipe = Recipe(
      content=recipe_with_preferences,
      prompt=f"Scraped from {url}",
      name=recipe_name
  )
  await add_to_db(db_recipe)
  db_recipe.original_id = db_recipe.id
  await update_recipe_in_db(db_recipe)

  return db_recipe
