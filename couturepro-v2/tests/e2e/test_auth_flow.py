import uuid


def email_unique():
    return f"test-{uuid.uuid4().hex[:8]}@test.com"


def test_register_retourne_un_compte_en_essai(client):
    r = client.post("/api/auth/register", json={
        "nom": "Test Couturiere", "email": email_unique(), "password": "azerty123",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["user"]["statut"] == "essai"
    assert data["user"]["forfait"] == "starter"
    assert data["acces"]["factures"] is True  # tout debloque pendant l'essai
    assert "token" in data


def test_register_refuse_un_email_deja_utilise(client):
    email = email_unique()
    payload = {"nom": "Test", "email": email, "password": "azerty123"}
    client.post("/api/auth/register", json=payload)
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400


def test_login_avec_bons_identifiants(client):
    email = email_unique()
    client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    r = client.post("/api/auth/login", json={"email": email, "password": "azerty123"})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == email


def test_login_refuse_mauvais_mot_de_passe(client):
    email = email_unique()
    client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    r = client.post("/api/auth/login", json={"email": email, "password": "faux_mdp"})
    assert r.status_code == 401


def test_me_sans_token_est_refuse(client):
    r = client.get("/api/auth/me")
    assert r.status_code in (401, 403)


def test_me_avec_token_valide_retourne_le_bon_user(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]

    r2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    assert r2.json()["user"]["email"] == email


def test_update_profil_modifie_les_champs(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r2 = client.put("/api/auth/me", headers=headers, json={
        "nomAtelier": "Atelier Lumière",
        "description": "Spécialiste en robes de soirée",
        "logoUrl": "https://example.com/logo.png",
    })
    assert r2.status_code == 200
    data = r2.json()
    assert data["nomAtelier"] == "Atelier Lumière"
    assert data["description"] == "Spécialiste en robes de soirée"
    assert data["logoUrl"] == "https://example.com/logo.png"


def test_update_profil_sans_token_est_refuse(client):
    r = client.put("/api/auth/me", json={"nomAtelier": "Test"})
    assert r.status_code in (401, 403)


def test_update_profil_ignore_les_champs_sensibles(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r2 = client.put("/api/auth/me", headers=headers, json={
        "nomAtelier": "Atelier Test",
        "role": "admin",
        "statut": "actif",
        "forfait": "premium",
    })
    assert r2.status_code == 200
    r3 = client.get("/api/auth/me", headers=headers)
    assert r3.json()["user"]["role"] != "admin"


def test_update_profil_modifie_les_champs(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r2 = client.put("/api/auth/me", headers=headers, json={
        "nomAtelier": "Atelier Lumière",
        "description": "Spécialiste en robes de soirée",
        "logoUrl": "https://example.com/logo.png",
    })
    assert r2.status_code == 200
    data = r2.json()
    assert data["nomAtelier"] == "Atelier Lumière"
    assert data["description"] == "Spécialiste en robes de soirée"
    assert data["logoUrl"] == "https://example.com/logo.png"


def test_update_profil_sans_token_est_refuse(client):
    r = client.put("/api/auth/me", json={"nomAtelier": "Test"})
    assert r.status_code in (401, 403)


def test_update_profil_ignore_les_champs_sensibles(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r2 = client.put("/api/auth/me", headers=headers, json={
        "nomAtelier": "Atelier Test",
        "role": "admin",
        "statut": "actif",
        "forfait": "premium",
    })
    assert r2.status_code == 200
    r3 = client.get("/api/auth/me", headers=headers)
    assert r3.json()["user"]["role"] != "admin"
