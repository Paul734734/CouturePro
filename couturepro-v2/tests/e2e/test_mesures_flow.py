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
        "clienteId": cliente_id, "poitrine": 92, "taille": 72, "hanche": 98,
    }, headers=headers(token))

    assert r.status_code == 201
    data = r.json()
    assert data["poitrine"] == 92
    assert data["updatedAt"] is not None


def test_mesure_refusee_si_cliente_dune_autre_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/mesures", json={
        "clienteId": cliente_id_a, "poitrine": 90,
    }, headers=headers(token_b))
    assert r.status_code == 404


def test_historique_garde_toutes_les_mesures_sans_ecraser(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 90}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 92}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 94}, headers=headers(token))

    r = client.get(f"/api/mesures/cliente/{cliente_id}", headers=headers(token))
    assert r.status_code == 200
    assert len(r.json()) == 3


def test_historique_trie_du_plus_recent_au_plus_ancien(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 90}, headers=headers(token))
    client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 92}, headers=headers(token))

    r = client.get(f"/api/mesures/cliente/{cliente_id}", headers=headers(token))
    mesures = r.json()
    # la plus recente (92) doit etre en premier
    assert mesures[0]["poitrine"] == 92
    assert mesures[1]["poitrine"] == 90


def test_modifier_une_mesure_specifique(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 90}, headers=headers(token))
    mesure_id = r.json()["id"]

    r2 = client.put(f"/api/mesures/{mesure_id}", json={"poitrine": 91}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["poitrine"] == 91


def test_supprimer_une_mesure(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/mesures", json={"clienteId": cliente_id, "poitrine": 90}, headers=headers(token))
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
        "clienteId": cliente_id_a, "poitrine": 90, "notesMorphologie": "secret",
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

    r = client.post("/api/mesures", json={"clienteId": cliente_id_a, "poitrine": 90}, headers=headers(token_a))
    mesure_id_a = r.json()["id"]

    r2 = client.put(f"/api/mesures/{mesure_id_a}", json={"poitrine": 999}, headers=headers(token_b))
    assert r2.status_code == 404
