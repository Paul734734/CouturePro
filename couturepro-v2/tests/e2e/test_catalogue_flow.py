import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_creer_et_lister_un_modele_de_catalogue(client):
    token = creer_utilisatrice(client)

    r = client.post("/api/catalogue", json={
        "nom": "Robe sirene wax", "categorie": "Robe", "prixIndicatif": 35000,
        "tempsConceptionEstime": 3,
    }, headers=headers(token))
    assert r.status_code == 201
    item_id = r.json()["id"]
    assert r.json()["actif"] is True
    assert r.json()["dateAjout"] is not None

    r2 = client.get("/api/catalogue", headers=headers(token))
    assert r2.status_code == 200
    assert any(i["id"] == item_id for i in r2.json())


def test_creer_modele_sans_nom_est_refuse(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/catalogue", json={"prixIndicatif": 1000}, headers=headers(token))
    assert r.status_code == 422


def test_modifier_un_modele_de_catalogue(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/catalogue", json={"nom": "Boubou homme"}, headers=headers(token))
    item_id = r.json()["id"]

    r2 = client.put(f"/api/catalogue/{item_id}", json={"prixIndicatif": 42000}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["prixIndicatif"] == 42000
    assert r2.json()["nom"] == "Boubou homme"  # inchange


def test_archiver_un_modele_le_retire_des_actifs(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/catalogue", json={"nom": "Tailleur classique"}, headers=headers(token))
    item_id = r.json()["id"]

    r2 = client.put(f"/api/catalogue/{item_id}", json={"actif": False}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["actif"] is False

    r3 = client.get("/api/catalogue", params={"actif": True}, headers=headers(token))
    noms = [i["nom"] for i in r3.json()]
    assert "Tailleur classique" not in noms


def test_supprimer_un_modele_de_catalogue(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/catalogue", json={"nom": "Chemise homme"}, headers=headers(token))
    item_id = r.json()["id"]

    r2 = client.delete(f"/api/catalogue/{item_id}", headers=headers(token))
    assert r2.status_code == 204

    r3 = client.get(f"/api/catalogue/{item_id}", headers=headers(token))
    assert r3.status_code == 404


def test_modele_de_catalogue_introuvable_renvoie_404(client):
    token = creer_utilisatrice(client)
    r = client.get("/api/catalogue/id-qui-nexiste-pas", headers=headers(token))
    assert r.status_code == 404


def test_catalogue_sans_token_est_refuse(client):
    r = client.get("/api/catalogue")
    assert r.status_code in (401, 403)


# --- Isolation multi-tenant : le point le plus important ---

def test_une_utilisatrice_ne_voit_jamais_le_catalogue_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/catalogue", json={"nom": "Modele secret de A"}, headers=headers(token_a))
    item_id_a = r.json()["id"]

    r2 = client.get(f"/api/catalogue/{item_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get("/api/catalogue", headers=headers(token_b))
    noms_b = [i["nom"] for i in r3.json()]
    assert "Modele secret de A" not in noms_b


def test_une_utilisatrice_ne_peut_pas_modifier_le_catalogue_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/catalogue", json={"nom": "Modele de A"}, headers=headers(token_a))
    item_id_a = r.json()["id"]

    r2 = client.put(f"/api/catalogue/{item_id_a}", json={"actif": False}, headers=headers(token_b))
    assert r2.status_code == 404


def test_une_utilisatrice_ne_peut_pas_supprimer_le_catalogue_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/catalogue", json={"nom": "Modele de A"}, headers=headers(token_a))
    item_id_a = r.json()["id"]

    r2 = client.delete(f"/api/catalogue/{item_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    r3 = client.get(f"/api/catalogue/{item_id_a}", headers=headers(token_a))
    assert r3.status_code == 200
