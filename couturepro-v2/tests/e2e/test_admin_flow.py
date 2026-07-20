import uuid


def creer_utilisatrice(client, nom="Test"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123"})
    return r.json()["token"], r.json()["user"]["id"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def promouvoir_admin(client, db_session=None):
    """Cree un compte puis le passe manuellement en admin via la DB de test
    n'est pas possible ici sans acces direct SQLAlchemy ; a la place on utilise
    le compte bootstrap cree automatiquement au demarrage de l'app si present,
    ou on skip si non applicable dans ce contexte de test isole."""
    pass


def login_admin(client):
    r = client.post("/api/auth/login", json={"email": "admin@couturepro.app", "password": "change-moi-avec-un-mot-de-passe-fort-et-unique"})
    assert r.status_code == 200, "le compte admin bootstrap doit exister au demarrage de l'app"
    return r.json()["token"]


def test_admin_peut_lister_les_utilisatrices(client):
    creer_utilisatrice(client, "Une Couturiere")
    token_admin = login_admin(client)

    r = client.get("/api/admin/utilisatrices", headers=headers(token_admin))
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


def test_admin_peut_suspendre_une_utilisatrice(client):
    _, user_id = creer_utilisatrice(client, "A Suspendre")
    token_admin = login_admin(client)

    r = client.put(f"/api/admin/utilisatrices/{user_id}", json={"statut": "suspendu"}, headers=headers(token_admin))
    assert r.status_code == 200
    assert r.json()["statut"] == "suspendu"
    assert r.json()["abonnementBloque"] is True


def test_admin_peut_changer_le_forfait_dune_utilisatrice(client):
    _, user_id = creer_utilisatrice(client, "A Upgrader")
    token_admin = login_admin(client)

    r = client.put(f"/api/admin/utilisatrices/{user_id}", json={"forfait": "elite"}, headers=headers(token_admin))
    assert r.status_code == 200
    assert r.json()["forfait"] == "elite"


def test_utilisatrice_suspendue_ne_peut_plus_se_connecter(client):
    token, user_id = creer_utilisatrice(client, "Bientot Suspendue")
    token_admin = login_admin(client)
    client.put(f"/api/admin/utilisatrices/{user_id}", json={"statut": "suspendu"}, headers=headers(token_admin))

    r = client.get("/api/auth/me", headers=headers(token))
    assert r.status_code == 403


def test_admin_dashboard_compte_les_utilisatrices(client):
    creer_utilisatrice(client, "Nouvelle Couturiere")
    token_admin = login_admin(client)

    r = client.get("/api/admin/dashboard", headers=headers(token_admin))
    assert r.status_code == 200
    assert r.json()["nbUtilisatricesTotal"] >= 1


def test_couturiere_ne_peut_pas_acceder_a_la_liste_des_utilisatrices(client):
    token, _ = creer_utilisatrice(client)
    r = client.get("/api/admin/utilisatrices", headers=headers(token))
    assert r.status_code == 403


def test_couturiere_ne_peut_pas_acceder_au_dashboard_admin(client):
    token, _ = creer_utilisatrice(client)
    r = client.get("/api/admin/dashboard", headers=headers(token))
    assert r.status_code == 403


def test_couturiere_ne_peut_pas_modifier_une_autre_utilisatrice(client):
    token_a, _ = creer_utilisatrice(client, "Atelier A")
    token_b, user_id_b = creer_utilisatrice(client, "Atelier B")

    r = client.put(f"/api/admin/utilisatrices/{user_id_b}", json={"statut": "suspendu"}, headers=headers(token_a))
    assert r.status_code == 403


def test_admin_sans_token_est_refuse(client):
    r = client.get("/api/admin/utilisatrices")
    assert r.status_code in (401, 403)
