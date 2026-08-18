"""mesures liste categorisee complete

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Anciennes colonnes -> nouvelles colonnes equivalentes (on garde la donnee existante)
RENAMES = [
    ('poitrine', 'tour_poitrine'),
    ('taille', 'tour_taille'),
    ('hanche', 'tour_hanches'),
    ('sous_poitrine', 'tour_sous_poitrine'),
    ('epaules', 'largeur_epaules'),
    ('bras', 'tour_bras'),
    ('manches', 'longueur_bras'),
    ('longueur_robe', 'longueur_totale_vetement'),
    ('longueur_jupe', 'longueur_jupe_pantalon'),
]

# Colonnes vraiment nouvelles, sans equivalent avant
NOUVELLES_COLONNES = [
    'tour_tete', 'tour_cou', 'hauteur_cou',
    'longueur_epaule', 'tour_carrure_dos', 'tour_carrure_devant',
    'longueur_dos', 'longueur_taille_devant', 'longueur_taille_hanches',
    'hauteur_taille', 'tour_ventre',
    'tour_coude', 'tour_poignet', 'longueur_epaule_coude', 'longueur_coude_poignet',
    'tour_cuisse', 'tour_genou', 'tour_mollet', 'tour_cheville',
    'longueur_entrejambe', 'longueur_totale_jambe', 'hauteur_genou',
    'hauteur_totale',
    'tour_tete_capuche', 'profondeur_emmanchure', 'largeur_dos_taille',
]

# Colonnes qui disparaissent (pas d'equivalent direct dans la nouvelle liste)
COLONNES_SUPPRIMEES = ['pantalon']


def upgrade() -> None:
    """Upgrade schema."""
    # 1) ajoute les nouvelles colonnes cibles des renommages
    for _, nouveau in RENAMES:
        op.add_column('mesures', sa.Column(nouveau, sa.Float(), nullable=True))

    # 2) copie la donnee de l'ancienne colonne vers la nouvelle
    for ancien, nouveau in RENAMES:
        op.execute(f'UPDATE mesures SET "{nouveau}" = "{ancien}"')

    # 3) transfere "pantalon" dans "longueur_jupe_pantalon" si ce dernier est vide
    op.execute(
        'UPDATE mesures SET "longueur_jupe_pantalon" = "pantalon" '
        'WHERE "longueur_jupe_pantalon" IS NULL AND "pantalon" IS NOT NULL'
    )

    # 4) supprime les anciennes colonnes (dont "pantalon")
    for ancien, _ in RENAMES:
        op.drop_column('mesures', ancien)
    for col in COLONNES_SUPPRIMEES:
        op.drop_column('mesures', col)

    # 5) ajoute les colonnes entierement nouvelles
    for col in NOUVELLES_COLONNES:
        op.add_column('mesures', sa.Column(col, sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    for col in NOUVELLES_COLONNES:
        op.drop_column('mesures', col)

    op.add_column('mesures', sa.Column('pantalon', sa.Float(), nullable=True))

    for ancien, _ in RENAMES:
        op.add_column('mesures', sa.Column(ancien, sa.Float(), nullable=True))

    for ancien, nouveau in RENAMES:
        op.execute(f'UPDATE mesures SET "{ancien}" = "{nouveau}"')
    op.execute('UPDATE mesures SET "pantalon" = "longueur_jupe_pantalon"')

    for _, nouveau in RENAMES:
        op.drop_column('mesures', nouveau)
