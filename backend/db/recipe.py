from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, select
from datetime import datetime
from .base import Base, async_session_maker

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String)
    content = Column(Text)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    is_latest = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "prompt": self.prompt,
            "content": self.content,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "parent_id": self.parent_id,
            "is_latest": self.is_latest
        }

async def add_to_db(recipe: Recipe):
    async with async_session_maker() as session:
        session.add(recipe)
        await session.commit()

async def fetch_recipes() -> list[Recipe]:
    async with async_session_maker() as session:
        result = await session.execute(select(Recipe))
        return list(result.scalars().all())

async def fetch_recipe(recipe_id: int) -> Recipe | None:
    async with async_session_maker() as session:
        result = await session.execute(select(Recipe).where(Recipe.id == recipe_id))
        return result.scalar_one_or_none()

async def fetch_children(recipe_id: int) -> list[Recipe]:
    async with async_session_maker() as session:
        result = await session.execute(select(Recipe).where(Recipe.parent_id == recipe_id))
        return list(result.scalars().all())

async def update_recipe(recipe: Recipe):
    async with async_session_maker() as session:
        await session.merge(recipe)
        await session.commit()

