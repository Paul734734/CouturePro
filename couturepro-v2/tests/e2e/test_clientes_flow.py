import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_creer_et_lister_une_cliente(client):
    token = creer_utilisatrice(client)

    r = client.post("/api/clientes", json={"nom": "Aminata Diallo", "ville": "Yaounde"}, headers=headers(token))
    assert r.status_code == 201
    cliente_id = r.json()["id"]
    assert r.json()["dateAjout"] is not None

    r2 = client.get("/api/clientes", headers=headers(token))
    assert r2.status_code == 200
    assert any(c["id"] == cliente_id for c in r2.json())


def test_modifier_une_cliente(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/clientes", json={"nom": "Fatou"}, headers=headers(token))
    cliente_id = r.json()["id"]

    r2 = client.put(f"/api/clientes/{cliente_id}", json={"ville": "Douala"}, headers=headers(token))
    assert r2.status_code == 200
    assert r2.json()["ville"] == "Douala"
    assert r2.json()["nom"] == "Fatou"  # inchange


def test_supprimer_une_cliente(client):
    token = creer_utilisatrice(client)
    r = client.post("/api/clientes", json={"nom": "Mariam"}, headers=headers(token))
    cliente_id = r.json()["id"]

    r2 = client.delete(f"/api/clientes/{cliente_id}", headers=headers(token))
    assert r2.status_code == 204

    r3 = client.get(f"/api/clientes/{cliente_id}", headers=headers(token))
    assert r3.status_code == 404


def test_cliente_introuvable_renvoie_404(client):
    token = creer_utilisatrice(client)
    r = client.get("/api/clientes/id-qui-nexiste-pas", headers=headers(token))
    assert r.status_code == 404


# --- Le test le plus important du projet : l'isolation multi-tenant ---

def test_une_utilisatrice_ne_voit_jamais_les_clientes_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/clientes", json={"nom": "Cliente secrete de A"}, headers=headers(token_a))
    cliente_id_a = r.json()["id"]

    # B ne doit pas pouvoir lire la cliente de A, meme en connaissant son id exact
    r2 = client.get(f"/api/clientes/{cliente_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    # la cliente de A ne doit pas apparaitre dans la liste de B
    r3 = client.get("/api/clientes", headers=headers(token_b))
    noms_b = [c["nom"] for c in r3.json()]
    assert "Cliente secrete de A" not in noms_b


def test_une_utilisatrice_ne_peut_pas_modifier_la_cliente_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/clientes", json={"nom": "Cliente de A"}, headers=headers(token_a))
    cliente_id_a = r.json()["id"]

    r2 = client.put(f"/api/clientes/{cliente_id_a}", json={"ville": "Piratee"}, headers=headers(token_b))
    assert r2.status_code == 404


def test_une_utilisatrice_ne_peut_pas_supprimer_la_cliente_dune_autre(client):
    token_a = creer_utilisatrice(client, "Atelier A")
    token_b = creer_utilisatrice(client, "Atelier B")

    r = client.post("/api/clientes", json={"nom": "Cliente de A"}, headers=headers(token_a))
    cliente_id_a = r.json()["id"]

    r2 = client.delete(f"/api/clientes/{cliente_id_a}", headers=headers(token_b))
    assert r2.status_code == 404

    # verifie que la cliente existe toujours cote A
    r3 = client.get(f"/api/clientes/{cliente_id_a}", headers=headers(token_a))
    assert r3.status_code == 200
