import asyncio
from sqlalchemy import text
import os
import sys
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)
from db import async_session_maker


async def migrate_add_name_column():
    async with async_session_maker() as session:
        await session.execute(text("ALTER TABLE recipes ADD COLUMN name VARCHAR(255)"))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(migrate_add_name_column())
