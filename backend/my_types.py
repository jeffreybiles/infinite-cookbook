from pydantic import BaseModel
from typing_extensions import List, Optional, TypedDict

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