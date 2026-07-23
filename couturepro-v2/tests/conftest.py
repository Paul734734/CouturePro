import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ["DATABASE_URL"] = "sqlite:///./data/test.db"
os.environ["SECRET_KEY"] = "test-secret-key-ne-pas-utiliser-en-prod"
os.environ.setdefault("ADMIN_EMAIL", "admin@couturepro.app")
os.environ.setdefault("ADMIN_PASSWORD", "change-moi-avec-un-mot-de-passe-fort-et-unique")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # base propre a chaque lancement de la suite de tests
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
