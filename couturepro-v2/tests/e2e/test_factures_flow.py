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


def test_creer_facture_genere_un_numero_auto(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token, nom="Aminata")

    r = client.post("/api/factures", json={
        "clienteId": cliente_id, "type": "facture", "montantTotal": 25000, "montantPaye": 10000,
    }, headers=headers(token))

    assert r.status_code == 201
    data = r.json()
    assert data["numero"].startswith("FAC-")
    assert data["clienteNom"] == "Aminata"
    assert data["montantReste"] == 15000
    assert data["statut"] == "partielle"


def test_numeros_de_facture_sont_sequentiels(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r1 = client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 1000}, headers=headers(token))
    r2 = client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 1000}, headers=headers(token))

    num1 = r1.json()["numero"]
    num2 = r2.json()["numero"]
    assert num1 != num2
    assert num1.endswith("001")
    assert num2.endswith("002")


def test_facture_entierement_payee_a_le_bon_statut(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/factures", json={
        "clienteId": cliente_id, "montantTotal": 5000, "montantPaye": 5000,
    }, headers=headers(token))
    assert r.json()["statut"] == "payee"
    assert r.json()["montantReste"] == 0


def test_facture_impayee_a_le_bon_statut(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 5000}, headers=headers(token))
    assert r.json()["statut"] == "impayee"


def test_cliente_nom_reste_fige_meme_si_cliente_renommee_apres(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token, nom="Nom Original")

    r = client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 1000}, headers=headers(token))
    facture_id = r.json()["id"]

    client.put(f"/api/clientes/{cliente_id}", json={"nom": "Nom Change"}, headers=headers(token))

    r2 = client.get(f"/api/factures/{facture_id}", headers=headers(token))
    assert r2.json()["clienteNom"] == "Nom Original"


def test_telechargement_pdf_facture(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token, nom="Fatou")

    r = client.post("/api/factures", json={
        "clienteId": cliente_id, "montantTotal": 15000, "montantPaye": 15000,
    }, headers=headers(token))
    facture_id = r.json()["id"]

    r2 = client.get(f"/api/factures/{facture_id}/pdf", headers=headers(token))
    assert r2.status_code == 200
    assert r2.headers["content-type"] == "application/pdf"
    assert len(r2.content) > 0


def test_isolation_multi_tenant_sur_factures(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)

    r = client.post("/api/factures", json={
        "clienteId": cliente_id_a, "montantTotal": 5000,
    }, headers=headers(token_a))
    facture_id_a = r.json()["id"]

    r2 = client.get(f"/api/factures/{facture_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get("/api/factures", headers=headers(token_b))
    assert all(f["id"] != facture_id_a for f in r3.json())


def test_supprimer_facture(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    r = client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 1000}, headers=headers(token))
    facture_id = r.json()["id"]

    r2 = client.delete(f"/api/factures/{facture_id}", headers=headers(token))
    assert r2.status_code == 204

    r3 = client.get(f"/api/factures/{facture_id}", headers=headers(token))
    assert r3.status_code == 404
