import os
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import Base, engine, SessionLocal
from app.models import User, Role, StatutUser, Forfait, Billing
from app.security import hash_password
from app.routers import auth, clientes, mesures, commandes, paiements, factures, dashboard, admin, uploads

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CouturePro API",
    description="API multi-tenant pour couturières, stylistes et ateliers de mode.",
    version="0.1.0",
)

# ⚠️ En prod, restreins allow_origins à ton vrai domaine (ex: Netlify).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/api/health")
def health():
    return {"status": "ok"}


def _bootstrap_admin():
    """Crée le compte superadmin au premier démarrage, si absent."""
    email = os.getenv("ADMIN_EMAIL", "admin@couturepro.app")
    password = os.getenv("ADMIN_PASSWORD", "change-moi-avec-un-mot-de-passe-fort-et-unique")

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
