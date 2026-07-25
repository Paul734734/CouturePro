import os
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import Base, engine, SessionLocal
from app.models import User, Role, StatutUser, Forfait, Billing
from app.security import hash_password
from app.routers import auth, clientes, mesures, commandes, paiements, factures, dashboard, admin, uploads, stock, catalogue, export, ateliers
from app.db_startup import sync_missing_columns

load_dotenv()

# 1) Crée les tables qui n'existent pas encore.
Base.metadata.create_all(bind=engine)
# 2) Ajoute les colonnes manquantes sur les tables déjà existantes
#    (create_all() ne le fait jamais). Voir app/db_startup.py pour le
#    contexte détaillé de ce garde-fou.
sync_missing_columns(engine, Base)

app = FastAPI(
    title="CouturePro API",
    description="API multi-tenant pour couturières, stylistes et ateliers de mode.",
    version="0.1.0",
)

# ⚠️ En prod, restreins allow_origins à ton vrai domaine (ex: Netlify).
# ALLOWED_ORIGINS reste configurable via variable d'env pour un contrôle
# explicite (ex: sur le VPS). En complément, on autorise toujours en dur
# les domaines de prod connus (couturepro.app) + les URLs Netlify
# (preview/deploy) via une regex, pour éviter un blocage CORS à chaque
# nouvelle URL de preview Netlify sans avoir à modifier le .env serveur.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,https://couturepro.app,https://www.couturepro.app"
).split(",")

ALLOWED_ORIGIN_REGEX = r"https://([a-zA-Z0-9-]+\.)?couturepro\.app$|https://[a-zA-Z0-9.-]+\.netlify\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(mesures.router)
app.include_router(commandes.router)
app.include_router(paiements.router)
app.include_router(factures.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(uploads.router)
app.include_router(stock.router)
app.include_router(catalogue.router)
app.include_router(export.router)
app.include_router(ateliers.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


def _bootstrap_admin():
    """Crée le compte superadmin au premier démarrage, si absent."""
    email = os.getenv("ADMIN_EMAIL", "admin@couturepro.app")
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        raise RuntimeError(
            "ADMIN_PASSWORD n'est pas définie. Définis-la dans .env "
            "(un mot de passe fort, unique) avant de démarrer l'application."
        )

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return
        admin = User(
            nom="Administrateur",
            email=email,
            password_hash=hash_password(password),
            nom_atelier="CouturePro Admin",
            role=Role.ADMIN,
            statut=StatutUser.ACTIF,
            forfait=Forfait.ELITE,
            billing=Billing.ANNUEL,
            date_inscription=datetime.utcnow(),
            date_expiration=datetime.utcnow() + timedelta(days=3650),
        )
        db.add(admin)
        db.commit()
        print(f"[bootstrap] Compte superadmin créé : {email}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    _bootstrap_admin()
