from fastapi import HTTPException
from db.recipe import Recipe, add_to_db, fetch_recipe, fetch_children, fetch_recipes, update_recipe as update_recipe_in_db
from ai_helpers import completion, check_validity, generate_name
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class RecipeRequest(BaseModel):
    recipeRequest: str

class UpdateRequest(BaseModel):
    recipe_id: int
    preferences: str

@router.post("/generate")
async def generate_recipe(request: RecipeRequest):
    try:
        recipe_completion = completion(f"Generate a recipe for {request.recipeRequest}. Include ingredients and steps.")
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

        updated_recipe_completion = completion(f"Update the recipe for {old_recipe.content} to include the following preferences: {request.preferences}")

        if not updated_recipe_completion:
            raise HTTPException(status_code=400, detail="Failed to update recipe")

        if not check_validity(updated_recipe_completion):
            raise HTTPException(status_code=400, detail="The response was not a recipe.  Try a different prompt.")

        recipe_name = generate_name(updated_recipe_completion)

        db_recipe = Recipe(
            parent_id=request.recipe_id,
            content=updated_recipe_completion,
            prompt=request.preferences,
            name=recipe_name,
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
    parent = await fetch_recipe(recipe.parent_id) if recipe.parent_id else None # type: ignore
    children = await fetch_children(int(recipe_id))
    return {"recipe": recipe, "children": children, "parent": parent}