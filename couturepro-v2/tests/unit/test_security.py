import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
os.environ.setdefault("SECRET_KEY", "test-secret-key-ne-pas-utiliser-en-prod")

from app.security import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password_est_different_du_mot_de_passe():
    hashed = hash_password("azerty123")
    assert hashed != "azerty123"


def test_verify_password_accepte_le_bon_mot_de_passe():
    hashed = hash_password("azerty123")
    assert verify_password("azerty123", hashed) is True


def test_verify_password_refuse_un_mauvais_mot_de_passe():
    hashed = hash_password("azerty123")
    assert verify_password("mauvais_mdp", hashed) is False


def test_token_encode_puis_decode_retrouve_le_payload():
    token = create_access_token({"sub": "user-123"})
    payload = decode_access_token(token)
    assert payload["sub"] == "user-123"


def test_decode_token_invalide_renvoie_none():
    assert decode_access_token("ceci.nest.pas_un_token") is None
