import io
import uuid


def creer_utilisatrice(client, nom="Test", forfait="pro"):
    email = f"{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={"nom": nom, "email": email, "password": "azerty123", "forfait": forfait})
    return r.json()["token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


# petit PNG valide 1x1 pixel, en bytes bruts
PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108020000009077"
    "5303000000097048597300000ec300000ec301c76fa864000000174944415478"
    "9c626001000000ffff03000006000557bf4e2f0000000049454e44ae426082"
)


def test_upload_photo_valide(client):
    token = creer_utilisatrice(client)
    files = {"file": ("modele.png", io.BytesIO(PNG_1PX), "image/png")}

    r = client.post("/api/upload/photo", files=files, headers=headers(token))
    assert r.status_code == 200
    assert r.json()["url"].startswith("/uploads/")
    assert r.json()["url"].endswith(".png")


def test_upload_refuse_extension_non_autorisee(client):
    token = creer_utilisatrice(client)
    files = {"file": ("document.pdf", io.BytesIO(b"contenu bidon"), "application/pdf")}

    r = client.post("/api/upload/photo", files=files, headers=headers(token))
    assert r.status_code == 400


def test_upload_refuse_fichier_vide(client):
    token = creer_utilisatrice(client)
    files = {"file": ("vide.png", io.BytesIO(b""), "image/png")}

    r = client.post("/api/upload/photo", files=files, headers=headers(token))
    assert r.status_code == 400


def test_upload_refuse_fichier_trop_volumineux(client):
    token = creer_utilisatrice(client)
    contenu_trop_gros = b"x" * (6 * 1024 * 1024)  # 6 Mo > limite de 5 Mo
    files = {"file": ("gros.png", io.BytesIO(contenu_trop_gros), "image/png")}

    r = client.post("/api/upload/photo", files=files, headers=headers(token))
    assert r.status_code == 400


def test_upload_refuse_sans_authentification(client):
    files = {"file": ("modele.png", io.BytesIO(PNG_1PX), "image/png")}
    r = client.post("/api/upload/photo", files=files)
    assert r.status_code in (401, 403)


def test_url_uploadee_est_accessible(client):
    token = creer_utilisatrice(client)
    files = {"file": ("modele.png", io.BytesIO(PNG_1PX), "image/png")}
    r = client.post("/api/upload/photo", files=files, headers=headers(token))
    url = r.json()["url"]

    r2 = client.get(url)
    assert r2.status_code == 200
