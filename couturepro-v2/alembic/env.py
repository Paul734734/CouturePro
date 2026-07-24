from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# Ajouter le chemin du projet pour que Alembic trouve app/
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import Base, DATABASE_URL
from app import models  # noqa: F401 — enregistre les tables sur Base.metadata
target_metadata = Base.metadata

# Alembic Config object
config = context.config

# alembic.ini contient une URL Postgres locale de développement en dur.
# On la remplace systématiquement par la vraie DATABASE_URL (variable
# d'environnement), pour qu'Alembic cible toujours la même base que
# l'application elle-même (ex: la base Postgres de Render en prod).
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

