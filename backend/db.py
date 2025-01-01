from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, select
from datetime import datetime
from typing import AsyncGenerator
import json

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
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    is_latest = Column(Boolean, default=True)


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
