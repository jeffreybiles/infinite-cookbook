from db.recipe import Recipe, add_to_db, update_recipe as update_recipe_in_db
from prompts import preferences_prompt
from my_types import RecipeRequest
from ai_helpers import completion, check_validity, generate_name
from fastapi import HTTPException

async def generate_and_save_recipe(request: RecipeRequest):
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

  return db_recipe