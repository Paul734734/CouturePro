import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Role, StatutUser
from app.schemas import (
    RegisterRequest, LoginRequest, LoginResponse, MeResponse, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest, UpdateProfilRequest,
)
from app.security import hash_password, verify_password, create_access_token, create_reset_token
from app.dependencies import get_current_user
from app.acces import calculer_acces

router = APIRouter(prefix="/api/auth", tags=["Authentification"])

ESSAI_DUREE_JOURS = 7


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    user = User(
        nom=payload.nom,
        email=payload.email,
        password_hash=hash_password(payload.password),
        nom_atelier=payload.nom_atelier,
        ville=payload.ville,
        telephone=payload.telephone,
        role=Role.COUTURIERE,
        statut=StatutUser.ESSAI,
        forfait=payload.forfait,
        billing=payload.billing,
        date_inscription=datetime.utcnow(),
        date_expiration=datetime.utcnow() + timedelta(days=ESSAI_DUREE_JOURS),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return LoginResponse(
        user=_to_user_out(user),
        token=token,
        acces=calculer_acces(user),
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )
    if user.statut == StatutUser.SUSPENDU:
        raise HTTPException(status_code=403, detail="Compte suspendu. Contactez le support.")

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return LoginResponse(
        user=_to_user_out(user),
        token=token,
        acces=calculer_acces(user),
    )


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return MeResponse(
        user=_to_user_out(current_user),
        acces=calculer_acces(current_user),
    )


@router.put("/me", response_model=UserOut)
def update_profil(
    payload: UpdateProfilRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return _to_user_out(current_user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Réponse volontairement neutre : ne révèle pas si l'email existe
    if user:
        token = create_reset_token()
        user.reset_token = token
        user.reset_token_expire = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        # TODO en prod : envoyer le lien par email/SMS.
        # devToken n'est renvoyé QUE si ENVIRONMENT=development, jamais en prod
        # (sinon n'importe qui connaissant un email pourrait reinitialiser son mot de passe)
        response = {"message": "Si ce compte existe, un lien a été envoyé."}
        if os.getenv("ENVIRONMENT", "development") == "development":
            response["devToken"] = token
        return response
    return {"message": "Si ce compte existe, un lien a été envoyé."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_token_expire or user.reset_token_expire < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré.")

    user.password_hash = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expire = None
    db.commit()
    return {"message": "Mot de passe mis à jour avec succès."}


def _to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        nom=user.nom,
        email=user.email,
        nom_atelier=user.nom_atelier,
        ville=user.ville,
        telephone=user.telephone,
        description=user.description,
        logo_url=user.logo_url,
        role=user.role,
        statut=user.statut_effectif,
        forfait=user.forfait,
        billing=user.billing,
        date_inscription=user.date_inscription,
        date_expiration=user.date_expiration,
        jours_restants=user.jours_restants,
    )
