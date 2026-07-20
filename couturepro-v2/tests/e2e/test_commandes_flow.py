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


def test_creer_commande_calcule_le_reste_a_payer(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/commandes", json={
        "clienteId": cliente_id,
        "typeVetement": "Robe ankara",
        "prixTotal": 25000,
        "avancePaye": 10000,
    }, headers=headers(token))

    assert r.status_code == 201
    data = r.json()
    assert data["resteAPayer"] == 15000
    assert data["statut"] == "en_attente"


def test_commande_refuse_si_cliente_dune_autre_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/commandes", json={
        "clienteId": cliente_id_a,
        "typeVetement": "Robe",
        "prixTotal": 10000,
        "avancePaye": 0,
    }, headers=headers(token_b))

    assert r.status_code == 404


def test_modifier_commande_recalcule_le_reste(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 20000, "avancePaye": 5000,
    }, headers=headers(token))
    commande_id = r.json()["id"]

    r2 = client.put(f"/api/commandes/{commande_id}", json={"avancePaye": 20000}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["resteAPayer"] == 0


def test_changer_statut_commande(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 15000, "avancePaye": 15000,
    }, headers=headers(token))
    commande_id = r.json()["id"]

    r2 = client.patch(f"/api/commandes/{commande_id}/statut", json={"statut": "livre"}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["statut"] == "livre"


def test_filtrer_commandes_par_statut(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe A", "prixTotal": 10000, "avancePaye": 0,
        "statut": "en_cours",
    }, headers=headers(token))
    client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe B", "prixTotal": 10000, "avancePaye": 0,
        "statut": "livre",
    }, headers=headers(token))

    r = client.get("/api/commandes?statut=livre", headers=headers(token))
    assert r.status_code == 200
    types = [c["typeVetement"] for c in r.json()]
    assert "Robe B" in types
    assert "Robe A" not in types


def test_isolation_multi_tenant_sur_commandes(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/commandes", json={
        "clienteId": cliente_id_a, "typeVetement": "Robe secrete", "prixTotal": 10000, "avancePaye": 0,
    }, headers=headers(token_a))
    commande_id_a = r.json()["id"]

    r2 = client.get(f"/api/commandes/{commande_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get("/api/commandes", headers=headers(token_b))
    assert all(c["id"] != commande_id_a for c in r3.json())
