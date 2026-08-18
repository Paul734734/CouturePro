"""ajout livraison expedition sur commandes

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-17 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('commandes', sa.Column('mode_livraison', sa.String(length=30), nullable=True, server_default='retrait_atelier'))
    op.add_column('commandes', sa.Column('prix_livraison', sa.Float(), nullable=True, server_default='0'))
    op.add_column('commandes', sa.Column('adresse_livraison', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('commandes', 'adresse_livraison')
    op.drop_column('commandes', 'prix_livraison')
    op.drop_column('commandes', 'mode_livraison')
