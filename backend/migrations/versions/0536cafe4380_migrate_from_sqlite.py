"""migrate_from_sqlite

Revision ID: 0536cafe4380
Revises: 7e9dd4970993
Create Date: 2025-01-06 10:08:39.055687

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0536cafe4380'
down_revision: Union[str, None] = '7e9dd4970993'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # This will be auto-generated based on your models
    op.create_table(
        'recipes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('original_id', sa.Integer(), nullable=True),
        sa.Column('prompt', sa.String(), nullable=True),
        sa.Column('content', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_latest', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('idx_recipes_original_id', 'recipes', ['original_id'])

def downgrade() -> None:
    op.drop_index('idx_recipes_original_id', table_name='recipes')
    op.drop_table('recipes')