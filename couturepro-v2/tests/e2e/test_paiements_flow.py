import uuid


def creer_utilisatrice(client, nom="Test", forfait="pro"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123", "forfait": forfait})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def creer_cliente(client, token, nom="Cliente Test"):
    r = client.post("/api/clientes", json={"nom": nom}, headers=headers(token))
    return r.json()["id"]


def creer_commande(client, token, cliente_id, prix_total=20000, avance_paye=0):
    r = client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": prix_total, "avancePaye": avance_paye,
    }, headers=headers(token))
    return r.json()["id"]


def test_paiement_met_a_jour_la_commande_liee(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    commande_id = creer_commande(client, token, cliente_id, prix_total=20000, avance_paye=0)

    r = client.post("/api/paiements", json={
        "commandeId": commande_id, "montant": 8000, "type": "avance",
    }, headers=headers(token))
    assert r.status_code == 201

    r2 = client.get(f"/api/commandes/{commande_id}", headers=headers(token))
    assert r2.json()["avancePaye"] == 8000
    assert r2.json()["resteAPayer"] == 12000


def test_deux_paiements_successifs_cumulent(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    commande_id = creer_commande(client, token, cliente_id, prix_total=30000, avance_paye=0)

    client.post("/api/paiements", json={"commandeId": commande_id, "montant": 10000}, headers=headers(token))
    client.post("/api/paiements", json={"commandeId": commande_id, "montant": 10000}, headers=headers(token))

    r = client.get(f"/api/commandes/{commande_id}", headers=headers(token))
    assert r.json()["avancePaye"] == 20000
    assert r.json()["resteAPayer"] == 10000


def test_paiement_refuse_pour_commande_dune_autre_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)
    commande_id_a = creer_commande(client, token_a, cliente_id_a)

    r = client.post("/api/paiements", json={
        "commandeId": commande_id_a, "montant": 5000,
    }, headers=headers(token_b))
    assert r.status_code == 404


def test_suivi_paiements_calcule_le_statut(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token, nom="Aminata")
    commande_id = creer_commande(client, token, cliente_id, prix_total=10000, avance_paye=0)

    client.post("/api/paiements", json={"commandeId": commande_id, "montant": 10000}, headers=headers(token))

    r = client.get("/api/paiements/suivi", headers=headers(token))
    assert r.status_code == 200
    suivi = next(s for s in r.json() if s["commandeId"] == commande_id)
    assert suivi["clienteNom"] == "Aminata"
    assert suivi["statut"] == "solde"
    assert suivi["resteAPayer"] == 0


def test_suivi_paiements_isole_par_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    cliente_id_a = creer_cliente(client, token_a)
    creer_commande(client, token_a, cliente_id_a)

    r = client.get("/api/paiements/suivi", headers=headers(token_b))
    assert r.status_code == 200
    assert r.json() == []


def test_totaux_paiements(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    commande_id = creer_commande(client, token, cliente_id, prix_total=15000, avance_paye=0)

    client.post("/api/paiements", json={"commandeId": commande_id, "montant": 6000}, headers=headers(token))

    r = client.get("/api/paiements/totaux", headers=headers(token))
    assert r.status_code == 200
    assert r.json()["totalEncaisse"] == 6000
    assert r.json()["totalReste"] == 9000
