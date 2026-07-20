from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import decode_access_token
from app.models import User, Role, StatutUser
from app.acces import calculer_acces

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    # Décode le JWT et retourne l'utilisatrice. Le user.id extrait ici est
    # CE QUI GARANTIT L'ISOLATION MULTI-TENANT : chaque routeur des modules
    # suivants filtrera systématiquement ses requêtes par userId == current_user.id.
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if user.statut == StatutUser.SUSPENDU:
        raise HTTPException(status_code=403, detail="Compte suspendu. Contactez le support.")

    return user


def get_current_superadmin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Accès réservé à l'administrateur.")
    return current_user


def require_acces(feature: str):
    """Dépendance paramétrable, ex: Depends(require_acces('factures')).
    Bloque l'accès à une fonctionnalité si le forfait/statut ne le permet pas
    (même logique que peutAcceder() côté frontend, mais imposée côté serveur)."""

    def checker(current_user: User = Depends(get_current_user)) -> User:
        acces = calculer_acces(current_user)
        if not acces.get(feature, False):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Fonctionnalité '{feature}' non incluse dans votre forfait actuel.",
            )
        return current_user

    return checker
