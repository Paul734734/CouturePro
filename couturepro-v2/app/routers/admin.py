from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, StatutUser, Forfait
from app.schemas import AdminUserOut, AdminUserUpdate, AdminDashboardStats
from app.dependencies import get_current_superadmin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _to_admin_out(user: User) -> AdminUserOut:
    return AdminUserOut(
        id=user.id,
        nom=user.nom,
        email=user.email,
        nom_atelier=user.nom_atelier,
        ville=user.ville,
        telephone=user.telephone,
        role=user.role,
        statut=user.statut_effectif,
        forfait=user.forfait,
        billing=user.billing,
        date_inscription=user.date_inscription,
        date_expiration=user.date_expiration,
        jours_restants=user.jours_restants,
        abonnement_bloque=user.abonnement_bloque,
    )


@router.get("/utilisatrices", response_model=List[AdminUserOut])
def lister_utilisatrices(
    statut: Optional[StatutUser] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superadmin),
):
    query = db.query(User).filter(User.role == "couturiere")
    users = query.order_by(User.date_inscription.desc()).all()
    resultat = [_to_admin_out(u) for u in users]
    if statut:
        resultat = [u for u in resultat if u.statut == statut]
    return resultat


@router.get("/utilisatrices/{user_id}", response_model=AdminUserOut)
def obtenir_utilisatrice(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisatrice introuvable.")
    return _to_admin_out(user)


@router.put("/utilisatrices/{user_id}", response_model=AdminUserOut)
def modifier_utilisatrice(
    user_id: str,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisatrice introuvable.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return _to_admin_out(user)


@router.get("/dashboard", response_model=AdminDashboardStats)
def dashboard_admin(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_superadmin),
):
    users = db.query(User).filter(User.role == "couturiere").all()

    nb_total = len(users)
    nb_actives = sum(1 for u in users if u.statut_effectif == StatutUser.ACTIF)
    nb_essai = sum(1 for u in users if u.statut_effectif == StatutUser.ESSAI)
    nb_expirees = sum(1 for u in users if u.statut_effectif == StatutUser.EXPIRE)
    nb_suspendues = sum(1 for u in users if u.statut_effectif == StatutUser.SUSPENDU)

    prix_mensuel = {Forfait.STARTER: 2500, Forfait.PRO: 5000, Forfait.ELITE: 9000}
    revenus_estimes = sum(
        prix_mensuel.get(u.forfait, 0) for u in users if u.statut_effectif == StatutUser.ACTIF
    )

    return AdminDashboardStats(
        nb_utilisatrices_total=nb_total,
        nb_utilisatrices_actives=nb_actives,
        nb_utilisatrices_essai=nb_essai,
        nb_utilisatrices_expirees=nb_expirees,
        nb_utilisatrices_suspendues=nb_suspendues,
        revenus_estimes_mensuel=revenus_estimes,
    )
