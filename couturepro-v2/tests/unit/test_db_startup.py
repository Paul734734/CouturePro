import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import create_engine, inspect, Column, String, Integer
from sqlalchemy.orm import declarative_base

from app.db_startup import sync_missing_columns


def test_sync_missing_columns_ajoute_reellement_la_colonne_sqlite():
    # Reproduit le cas reel : une table deja creee (sans la colonne), puis
    # un modele qui la declare desormais. sync_missing_columns doit l'ajouter
    # via une vraie requete SQLite (pas de "IF NOT EXISTS", non supporte).
    engine = create_engine("sqlite:///:memory:")

    BaseV1 = declarative_base()

    class Truc(BaseV1):
        __tablename__ = "trucs"
        id = Column(Integer, primary_key=True)

    BaseV1.metadata.create_all(bind=engine)

    BaseV2 = declarative_base()

    class TrucV2(BaseV2):
        __tablename__ = "trucs"
        id = Column(Integer, primary_key=True)
        nouveau_champ = Column(String(50), nullable=True)

    sync_missing_columns(engine, BaseV2)

    colonnes = {c["name"] for c in inspect(engine).get_columns("trucs")}
    assert "nouveau_champ" in colonnes


def test_sync_missing_columns_est_idempotent():
    engine = create_engine("sqlite:///:memory:")
    BaseV1 = declarative_base()

    class Machin(BaseV1):
        __tablename__ = "machins"
        id = Column(Integer, primary_key=True)

    BaseV1.metadata.create_all(bind=engine)

    BaseV2 = declarative_base()

    class MachinV2(BaseV2):
        __tablename__ = "machins"
        id = Column(Integer, primary_key=True)
        champ = Column(String(20), nullable=True)

    # Deux appels successifs ne doivent jamais lever d'exception
    sync_missing_columns(engine, BaseV2)
    sync_missing_columns(engine, BaseV2)

    colonnes = {c["name"] for c in inspect(engine).get_columns("machins")}
    assert "champ" in colonnes
