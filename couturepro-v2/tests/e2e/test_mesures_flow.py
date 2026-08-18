import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def creer_cliente(client, token, nom="Cliente Test"):
    r = client.post("/api/clientes", json={"nom": nom}, headers=headers(token))
    return r.json()["id"]


def test_creer_une_mesure(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={
        "clienteId": cliente_id, "tourPoitrine": 92, "tourTaille": 72, "tourHanches": 98,
    }, headers=headers(token))

    assert r.status_code == 201
    data = r.json()
    assert data["tourPoitrine"] == 92
    assert data["updatedAt"] is not None


def test_mesure_refusee_si_cliente_dune_autre_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/mesures", json={
        "clienteId": cliente_id_a, "tourPoitrine": 90,
    }, headers=headers(token_b))
    assert r.status_code == 404


def test_historique_garde_toutes_les_mesures_sans_ecraser(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 90}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 92}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 94}, headers=headers(token))

    r = client.get(f"/api/mesures/cliente/{cliente_id}", headers=headers(token))
    assert r.status_code == 200
    assert len(r.json()) == 3


def test_historique_trie_du_plus_recent_au_plus_ancien(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 90}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 92}, headers=headers(token))

    r = client.get(f"/api/mesures/cliente/{cliente_id}", headers=headers(token))
    mesures = r.json()
    # la plus recente (92) doit etre en premier
    assert mesures[0]["tourPoitrine"] == 92
    assert mesures[1]["tourPoitrine"] == 90


def test_modifier_une_mesure_specifique(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 90}, headers=headers(token))
    mesure_id = r.json()["id"]

    r2 = client.put(f"/api/mesures/{mesure_id}", json={"tourPoitrine": 91}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["tourPoitrine"] == 91


def test_supprimer_une_mesure(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={"clienteId": cliente_id, "tourPoitrine": 90}, headers=headers(token))
    mesure_id = r.json()["id"]

    r2 = client.delete(f"/api/mesures/{mesure_id}", headers=headers(token))
    assert r2.status_code == 204

    r3 = client.get(f"/api/mesures/{mesure_id}", headers=headers(token))
    assert r3.status_code == 404


def test_isolation_multi_tenant_sur_mesures(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/mesures", json={
        "clienteId": cliente_id_a, "tourPoitrine": 90, "notesMorphologie": "secret",
    }, headers=headers(token_a))
    mesure_id_a = r.json()["id"]

    r2 = client.get(f"/api/mesures/{mesure_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get(f"/api/mesures/cliente/{cliente_id_a}", headers=headers(token_b))
    assert r3.status_code == 404


def test_une_utilisatrice_ne_peut_pas_modifier_la_mesure_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/mesures", json={"clienteId": cliente_id_a, "tourPoitrine": 90}, headers=headers(token_a))
    mesure_id_a = r.json()["id"]

    r2 = client.put(f"/api/mesures/{mesure_id_a}", json={"tourPoitrine": 999}, headers=headers(token_b))
    assert r2.status_code == 404


def test_creer_une_mesure_avec_la_liste_categorisee_complete(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={
        "clienteId": cliente_id,
        "tourTete": 56, "tourCou": 36, "hauteurCou": 8,
        "largeurEpaules": 40, "tourCarrureDos": 38,
        "longueurDos": 39, "tourVentre": 88,
        "tourCuisse": 58, "hauteurGenou": 45,
        "hauteurTotale": 168,
        "tourTeteCapuche": 58, "profondeurEmmanchure": 20,
    }, headers=headers(token))

    assert r.status_code == 201
    data = r.json()
    assert data["tourTete"] == 56
    assert data["tourCarrureDos"] == 38
    assert data["tourCuisse"] == 58
    assert data["tourTeteCapuche"] == 58
    assert data["profondeurEmmanchure"] == 20
