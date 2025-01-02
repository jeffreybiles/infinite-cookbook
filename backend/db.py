from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, select, update, text
from datetime import datetime
from typing import AsyncGenerator

# Database setup
DATABASE_URL = "sqlite+aiosqlite:///./recipes.db"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

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

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

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

