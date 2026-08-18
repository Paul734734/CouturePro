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
    # L'essai reflete le forfait choisi (starter par defaut) : pas de deblocage total.
    assert data["acces"]["factures"] is True
    assert data["acces"]["paiements"] is False
    assert data["acces"]["maxClientes"] == 30
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


def test_register_avec_quartier_est_persiste(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={
        "nom": "Test Couturiere", "email": email, "password": "azerty123",
        "ville": "Douala", "quartier": "Bonapriso",
    })
    assert r.status_code == 201
    assert r.json()["user"]["quartier"] == "Bonapriso"


def test_update_profil_modifie_le_quartier(client):
    email = email_unique()
    r = client.post("/api/auth/register", json={"nom": "Test", "email": email, "password": "azerty123"})
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r2 = client.put("/api/auth/me", headers=headers, json={"quartier": "Bastos"})
    assert r2.status_code == 200
    assert r2.json()["quartier"] == "Bastos"

    r3 = client.get("/api/auth/me", headers=headers)
    assert r3.json()["user"]["quartier"] == "Bastos"
