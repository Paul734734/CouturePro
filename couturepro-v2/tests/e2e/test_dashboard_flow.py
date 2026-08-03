import uuid
from datetime import datetime, timedelta


def creer_utilisatrice(client, nom="Test", forfait="pro"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123", "forfait": forfait})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def creer_cliente(client, token, nom="Cliente Test"):
    r = client.post("/api/clientes", json={"nom": nom}, headers=headers(token))
    return r.json()["id"]


def test_dashboard_vide_pour_nouvelle_utilisatrice(client):
    token = creer_utilisatrice(client)
    r = client.get("/api/dashboard/stats", headers=headers(token))
    assert r.status_code == 200
    data = r.json()
    assert data["nbClientes"] == 0
    assert data["commandesEnCours"] == 0
    assert data["paiementsRecusMois"] == 0


def test_dashboard_compte_les_clientes(client):
    token = creer_utilisatrice(client)
    creer_cliente(client, token, "Aminata")
    creer_cliente(client, token, "Fatou")

    r = client.get("/api/dashboard/stats", headers=headers(token))
    assert r.json()["nbClientes"] == 2


def test_dashboard_compte_les_commandes_en_cours(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)

    client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 10000, "avancePaye": 0,
        "statut": "en_cours",
    }, headers=headers(token))
    client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 10000, "avancePaye": 0,
        "statut": "livre",
    }, headers=headers(token))

    r = client.get("/api/dashboard/stats", headers=headers(token))
    assert r.json()["commandesEnCours"] == 1


def test_dashboard_compte_les_paiements_recus_ce_mois(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    r = client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 20000, "avancePaye": 0,
    }, headers=headers(token))
    commande_id = r.json()["id"]

    client.post("/api/paiements", json={"commandeId": commande_id, "montant": 7000}, headers=headers(token))

    r2 = client.get("/api/dashboard/stats", headers=headers(token))
    assert r2.json()["paiementsRecusMois"] == 7000


def test_dashboard_calcule_reste_a_encaisser(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    client.post("/api/commandes", json={
        "clienteId": cliente_id, "typeVetement": "Robe", "prixTotal": 15000, "avancePaye": 5000,
    }, headers=headers(token))

    r = client.get("/api/dashboard/stats", headers=headers(token))
    assert r.json()["resteAEncaisser"] == 10000


def test_dashboard_compte_les_factures_impayees(client):
    token = creer_utilisatrice(client)
    cliente_id = creer_cliente(client, token)
    client.post("/api/factures", json={"clienteId": cliente_id, "montantTotal": 5000}, headers=headers(token))
    client.post("/api/factures", json={
        "clienteId": cliente_id, "montantTotal": 5000, "montantPaye": 5000,
    }, headers=headers(token))

    r = client.get("/api/dashboard/stats", headers=headers(token))
    assert r.json()["facturesImpayees"] == 1


def test_dashboard_isole_par_utilisatrice(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")
    creer_cliente(client, token_a, "Cliente de A")

    r = client.get("/api/dashboard/stats", headers=headers(token_b))
    assert r.json()["nbClientes"] == 0
