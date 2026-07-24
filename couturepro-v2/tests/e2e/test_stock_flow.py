import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_creer_et_lister_un_article_de_stock(client):
    token = creer_utilisatrice(client)

    r = client.post("/api/stock", json={
        "nom": "Tissu wax bleu", "categorie": "Tissu", "quantite": 12, "unite": "metre",
    }, headers=headers(token))
    assert r.status_code == 201
    article_id = r.json()["id"]
    assert r.json()["quantite"] == 12
    assert r.json()["dateAjout"] is not None

    r2 = client.get("/api/stock", headers=headers(token))
    assert r2.status_code == 200
    assert any(a["id"] == article_id for a in r2.json())


def test_creer_article_sans_nom_est_refuse(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/stock", json={"quantite": 5}, headers=headers(token))
    assert r.status_code == 422


def test_modifier_un_article_de_stock(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/stock", json={"nom": "Fil noir", "quantite": 20, "unite": "rouleau"}, headers=headers(token))
    article_id = r.json()["id"]

    r2 = client.put(f"/api/stock/{article_id}", json={"quantite": 5}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["quantite"] == 5
    assert r2.json()["nom"] == "Fil noir"  # inchange


def test_supprimer_un_article_de_stock(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/stock", json={"nom": "Boutons dores", "quantite": 100}, headers=headers(token))
    article_id = r.json()["id"]

    r2 = client.delete(f"/api/stock/{article_id}", headers=headers(token))
    assert r2.status_code == 204

    r3 = client.get(f"/api/stock/{article_id}", headers=headers(token))
    assert r3.status_code == 404


def test_article_de_stock_introuvable_renvoie_404(client):
    token = creer_utilisatrice(client)
    r = client.get("/api/stock/id-qui-nexiste-pas", headers=headers(token))
    assert r.status_code == 404


def test_filtre_alerte_ne_retourne_que_les_articles_sous_le_seuil(client):
    token = creer_utilisatrice(client)
    client.post("/api/stock", json={"nom": "Tissu rouge", "quantite": 2, "seuilAlerte": 5}, headers=headers(token))
    client.post("/api/stock", json={"nom": "Tissu vert", "quantite": 50, "seuilAlerte": 5}, headers=headers(token))

    r = client.get("/api/stock", params={"alerte": True}, headers=headers(token))
    assert r.status_code == 200
    noms = [a["nom"] for a in r.json()]
    assert "Tissu rouge" in noms
    assert "Tissu vert" not in noms


def test_stock_sans_token_est_refuse(client):
    r = client.get("/api/stock")
    assert r.status_code in (401, 403)


# --- Isolation multi-tenant : le point le plus important ---

def test_une_utilisatrice_ne_voit_jamais_le_stock_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/stock", json={"nom": "Tissu secret de A", "quantite": 3}, headers=headers(token_a))
    article_id_a = r.json()["id"]

    r2 = client.get(f"/api/stock/{article_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get("/api/stock", headers=headers(token_b))
    noms_b = [a["nom"] for a in r3.json()]
    assert "Tissu secret de A" not in noms_b


def test_une_utilisatrice_ne_peut_pas_modifier_le_stock_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/stock", json={"nom": "Article de A", "quantite": 10}, headers=headers(token_a))
    article_id_a = r.json()["id"]

    r2 = client.put(f"/api/stock/{article_id_a}", json={"quantite": 0}, headers=headers(token_b))
    assert r2.status_code == 404


def test_une_utilisatrice_ne_peut_pas_supprimer_le_stock_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/stock", json={"nom": "Article de A", "quantite": 10}, headers=headers(token_a))
    article_id_a = r.json()["id"]

    r2 = client.delete(f"/api/stock/{article_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get(f"/api/stock/{article_id_a}", headers=headers(token_a))
    assert r3.status_code == 200
