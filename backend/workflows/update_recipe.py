from db.recipe import Recipe, add_to_db, fetch_recipe, update_recipe as update_recipe_in_db
from prompts import preferences_prompt
from my_types import UpdateRequest
from ai_helpers import completion, check_validity, generate_name
from fastapi import HTTPException

async def update_recipe_and_save(request: UpdateRequest):
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

  return db_recipe