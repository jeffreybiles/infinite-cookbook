import asyncio
from sqlalchemy import text
import os
import sys
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)
from db.base import async_session_maker


async def migrate_populate_original_id():
    async with async_session_maker() as session:
        roots = await session.execute(text("SELECT id FROM recipes WHERE parent_id IS NULL"))
        for root in roots:
          root_id = root.id
          result = await session.execute(text("SELECT id FROM recipes WHERE parent_id = :id"), {"id": root.id})
          await session.execute(text("UPDATE recipes SET original_id = :id WHERE id = :root_id"), {"id": root_id, "root_id": root_id})
          children = []
          children.extend(result.scalars().all())

          print(f"Root: {root_id}")
          while children:
            child = children.pop(0)
            print(f"Child: {child}")
            await session.execute(text("UPDATE recipes SET original_id = :id WHERE id = :root_id"), {"id": root_id, "root_id": child})
            result = await session.execute(text("SELECT id FROM recipes WHERE parent_id = :id"), {"id": child})
            children.extend(result.scalars().all())
        await session.commit()

if __name__ == "__main__":
    asyncio.run(migrate_populate_original_id())
