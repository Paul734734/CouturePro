"""
Réconciliation de schéma au démarrage.

Contexte : historiquement, les tables de ce projet ont été créées via
``Base.metadata.create_all()`` (dans app/main.py) plutôt que via Alembic.
Or ``create_all()`` crée les tables manquantes mais ne modifie JAMAIS une
table déjà existante. Résultat : toute colonne ajoutée à un modèle après
la création initiale d'une table (ex: users.quartier, users.description,
commandes.temps_conception) n'a jamais été appliquée sur la base réelle,
puisque l'historique Alembic n'a lui non plus jamais tourné en prod.

Cette fonction comble cet écart de façon volontairement prudente :
- elle ne fait QUE des ajouts (jamais de suppression, de renommage, ni de
  changement de type sur une colonne existante) ;
- elle est idempotente : peut tourner à chaque démarrage sans risque ;
- elle s'appuie sur SQLAlchemy Inspector (l'état réel de la base), pas
  sur l'historique des révisions Alembic, qui ne reflète pas la réalité
  de cette base.

Une fois la base stabilisée, un ``alembic stamp head`` ponctuel (à faire
manuellement, une seule fois, via un shell sur l'environnement de prod)
permettra de reprendre un usage normal d'Alembic pour les migrations
futures. Voir TESTS.md / README pour la procédure.
"""
import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger("db_startup")


def sync_missing_columns(engine: Engine, base) -> None:
    """Ajoute, table par table, les colonnes présentes dans les modèles
    SQLAlchemy mais absentes de la base réelle.

    Ne touche jamais aux tables qui n'existent pas encore (create_all()
    s'en charge séparément) ni aux colonnes déjà présentes.
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    for table in base.metadata.sorted_tables:
        if table.name not in existing_tables:
            # Nouvelle table : déjà gérée par Base.metadata.create_all().
            continue

        try:
            existing_columns = {
                col["name"] for col in inspector.get_columns(table.name)
            }
        except Exception:
            logger.exception(
                "[db_startup] Impossible d'inspecter la table %s, on l'ignore.",
                table.name,
            )
            continue

        for column in table.columns:
            if column.name in existing_columns:
                continue

            try:
                col_type = column.type.compile(dialect=engine.dialect)
                ddl = (
                    f'ALTER TABLE "{table.name}" '
                    f'ADD COLUMN IF NOT EXISTS "{column.name}" {col_type}'
                )
                # Toujours ajoutée en NULLABLE : on ne peut pas ajouter une
                # colonne NOT NULL sans valeur par défaut sur une table qui
                # contient déjà des lignes. Une contrainte NOT NULL stricte
                # doit passer par une vraie migration Alembic dédiée.
                with engine.begin() as conn:
                    logger.warning(
                        "[db_startup] Colonne manquante détectée : %s.%s "
                        "-> ajout automatique (%s, nullable)",
                        table.name, column.name, col_type,
                    )
                    conn.execute(text(ddl))
            except Exception:
                logger.exception(
                    "[db_startup] Échec de l'ajout de %s.%s, on continue "
                    "avec les colonnes suivantes.",
                    table.name, column.name,
                )
