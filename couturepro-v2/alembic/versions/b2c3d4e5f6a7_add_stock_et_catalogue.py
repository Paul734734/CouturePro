"""add stock et catalogue

Revision ID: b2c3d4e5f6a7
Revises: 9a1b2c3d4e5f
Create Date: 2026-07-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = '9a1b2c3d4e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'articles_stock',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('nom', sa.String(length=150), nullable=False),
        sa.Column('categorie', sa.String(length=100), nullable=True),
        sa.Column('quantite', sa.Float(), nullable=True),
        sa.Column('unite', sa.String(length=20), nullable=True),
        sa.Column('seuil_alerte', sa.Float(), nullable=True),
        sa.Column('prix_unitaire', sa.Float(), nullable=True),
        sa.Column('fournisseur', sa.String(length=150), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('date_ajout', sa.DateTime(), nullable=True),
        sa.Column('date_maj', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_articles_stock_user_id'), 'articles_stock', ['user_id'], unique=False)

    op.create_table(
        'articles_catalogue',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('nom', sa.String(length=150), nullable=False),
        sa.Column('categorie', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('prix_indicatif', sa.Float(), nullable=True),
        sa.Column('temps_conception_estime', sa.Float(), nullable=True),
        sa.Column('image_url', sa.String(length=255), nullable=True),
        sa.Column('actif', sa.Boolean(), nullable=True),
        sa.Column('date_ajout', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_articles_catalogue_user_id'), 'articles_catalogue', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_articles_catalogue_user_id'), table_name='articles_catalogue')
    op.drop_table('articles_catalogue')
    op.drop_index(op.f('ix_articles_stock_user_id'), table_name='articles_stock')
    op.drop_table('articles_stock')
