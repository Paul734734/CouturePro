import uuid

from tests.e2e.test_ateliers_flow import creer_utilisatrice, headers, passer_en_elite


def _creer_atelier(client, token):
    r = client.post("/api/ateliers", json={"nom": "Atelier Bonanjo"}, headers=headers(token))
    assert r.status_code == 201
    return r.json()["id"]


def test_cliente_sans_atelier_id_va_dans_espace_principal(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)

    r = client.post("/api/clientes", json={"nom": "Aïcha"}, headers=headers(token))
    assert r.status_code == 201
    assert r.json()["atelierId"] is None

    r2 = client.get("/api/clientes", headers=headers(token))
    assert len(r2.json()) == 1


def test_cliente_rattachee_a_un_atelier_secondaire(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)
    atelier_id = _creer_atelier(client, token)

    r = client.post(
        "/api/clientes",
        json={"nom": "Fatou", "atelierId": atelier_id},
        headers=headers(token),
    )
    assert r.status_code == 201
    assert r.json()["atelierId"] == atelier_id


def test_espaces_strictement_cloisonnes_entre_eux(client):
    """Une cliente de l'espace principal n'apparaît pas quand on filtre sur
    un atelier secondaire, et inversement."""
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)
    atelier_id = _creer_atelier(client, token)

    client.post("/api/clientes", json={"nom": "Principal"}, headers=headers(token))
    client.post("/api/clientes", json={"nom": "Secondaire", "atelierId": atelier_id}, headers=headers(token))

    r_principal = client.get("/api/clientes", headers=headers(token))
    assert [c["nom"] for c in r_principal.json()] == ["Principal"]

    r_secondaire = client.get(f"/api/clientes?atelier_id={atelier_id}", headers=headers(token))
    assert [c["nom"] for c in r_secondaire.json()] == ["Secondaire"]


def test_creer_cliente_avec_atelier_id_dune_autre_utilisatrice_refuse(client):
    token_a, user_id_a = creer_utilisatrice(client, nom="A")
    token_b, user_id_b = creer_utilisatrice(client, nom="B")
    passer_en_elite(client, user_id_a)
    passer_en_elite(client, user_id_b)

    atelier_de_a = _creer_atelier(client, token_a)

    r = client.post(
        "/api/clientes",
        json={"nom": "Intrus", "atelierId": atelier_de_a},
        headers=headers(token_b),
    )
    assert r.status_code == 404


def test_commande_et_stock_et_catalogue_respectent_le_meme_cloisonnement(client):
    token, user_id = creer_utilisatrice(client)
    passer_en_elite(client, user_id)
    atelier_id = _creer_atelier(client, token)

    r_cliente = client.post(
        "/api/clientes", json={"nom": "Cliente Secondaire", "atelierId": atelier_id}, headers=headers(token)
    )
    cliente_id = r_cliente.json()["id"]

    r_cmd = client.post(
        "/api/commandes",
        json={"clienteId": cliente_id, "typeVetement": "Robe", "atelierId": atelier_id},
        headers=headers(token),
    )
    assert r_cmd.status_code == 201
    assert r_cmd.json()["atelierId"] == atelier_id

    r_stock = client.post(
        "/api/stock", json={"nom": "Tissu wax", "atelierId": atelier_id}, headers=headers(token)
    )
    assert r_stock.status_code == 201
    assert r_stock.json()["atelierId"] == atelier_id

    r_cat = client.post(
        "/api/catalogue", json={"nom": "Modèle 12", "atelierId": atelier_id}, headers=headers(token)
    )
    assert r_cat.status_code == 201
    assert r_cat.json()["atelierId"] == atelier_id

    # Rien de tout ça ne doit apparaître dans l'espace principal.
    assert client.get("/api/commandes", headers=headers(token)).json() == []
    assert client.get("/api/stock", headers=headers(token)).json() == []
    assert client.get("/api/catalogue", headers=headers(token)).json() == []
