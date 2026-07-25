import os
import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"], r.json()["user"]["id"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def login_admin(client):
    email = os.getenv("ADMIN_EMAIL", "admin@couturepro.app")
    password = os.getenv("ADMIN_PASSWORD", "change-moi-avec-un-mot-de-passe-fort-et-unique")
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    return r.json()["token"]


def passer_en_elite(client, user_id):
    token_admin = login_admin(client)
    r = client.put(
        f"/api/admin/utilisatrices/{user_id}",
        json={"forfait": "elite", "statut": "actif"},
        headers=headers(token_admin),
    )
    assert r.status_code == 200


def test_elite_peut_creer_un_atelier(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)

    r = client.post("/api/ateliers", json={"nom": "Atelier Bonanjo"}, headers=headers(token))
    assert r.status_code == 201
    assert r.json()["nom"] == "Atelier Bonanjo"

    r2 = client.get("/api/ateliers", headers=headers(token))
    assert r2.status_code == 200
    assert len(r2.json()) == 1


def test_elite_ne_peut_pas_depasser_trois_ateliers(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)

    for i in range(3):
        r = client.post("/api/ateliers", json={"nom": f"Atelier {i}"}, headers=headers(token))
        assert r.status_code == 201

    r4 = client.post("/api/ateliers", json={"nom": "Atelier de trop"}, headers=headers(token))
    assert r4.status_code == 403


def test_starter_ne_peut_pas_creer_datelier(client):
    token, user_id = creer_utilisatrice(client)
    token_admin = login_admin(client)
    client.put(
        f"/api/admin/utilisatrices/{user_id}",
        json={"forfait": "starter", "statut": "actif"},
        headers=headers(token_admin),
    )

    r = client.post("/api/ateliers", json={"nom": "Atelier interdit"}, headers=headers(token))
    assert r.status_code == 402


def test_pro_ne_peut_pas_creer_datelier(client):
    token, user_id = creer_utilisatrice(client)
    token_admin = login_admin(client)
    client.put(
        f"/api/admin/utilisatrices/{user_id}",
        json={"forfait": "pro", "statut": "actif"},
        headers=headers(token_admin),
    )

    r = client.post("/api/ateliers", json={"nom": "Atelier interdit"}, headers=headers(token))
    assert r.status_code == 402


def test_modifier_et_supprimer_un_atelier(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)

    r = client.post("/api/ateliers", json={"nom": "Atelier A"}, headers=headers(token))
    atelier_id = r.json()["id"]

    r2 = client.put(f"/api/ateliers/{atelier_id}", json={"nom": "Atelier A renommé"}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["nom"] == "Atelier A renommé"

    r3 = client.delete(f"/api/ateliers/{atelier_id}", headers=headers(token))
    assert r3.status_code == 204

    r4 = client.get("/api/ateliers", headers=headers(token))
    assert r4.json() == []


def test_une_utilisatrice_ne_voit_pas_les_ateliers_dune_autre(client):
    token_a, user_id_a = creer_utilisatrice(client, nom="A")
    token_b, user_id_b = creer_utilisatrice(client, nom="B")
    passer_en_elite(client, user_id_a)
    passer_en_elite(client, user_id_b)

    client.post("/api/ateliers", json={"nom": "Atelier de A"}, headers=headers(token_a))

    r = client.get("/api/ateliers", headers=headers(token_b))
    assert r.json() == []
