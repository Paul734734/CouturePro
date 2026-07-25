"""Helper partagé pour le multi-atelier (forfait Elite).

Sémantique retenue : l'espace "principal" (implicite, celui d'avant le
multi-atelier) correspond à atelier_id = NULL sur les tables métier
(clientes, commandes, articles_stock, articles_catalogue). Un espace
secondaire correspond à une ligne de la table `ateliers`. Les espaces
sont strictement cloisonnés : consulter un espace ne montre jamais les
données d'un autre espace, y compris l'espace principal.

Aucun backfill n'est nécessaire : toutes les données existantes ont
naturellement atelier_id = NULL au moment de l'ajout de la colonne
(gérée par la réconciliation de schéma, app/db_startup.py), donc elles
restent visibles dans l'espace principal, là où elles ont toujours été.
"""
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Query, Session

from app.models import Atelier, User


def valider_atelier_id(db: Session, current_user: User, atelier_id: Optional[str]) -> Optional[str]:
    """Vérifie que `atelier_id` (si fourni) appartient bien à l'utilisatrice
    courante. Lève 404 sinon. Retourne l'id tel quel (ou None)."""
    if atelier_id is None:
        return None
    existe = (
        db.query(Atelier)
        .filter(Atelier.id == atelier_id, Atelier.user_id == current_user.id)
        .first()
    )
    if not existe:
        raise HTTPException(status_code=404, detail="Atelier introuvable.")
    return atelier_id


def filtrer_par_atelier(query: Query, model, atelier_id: Optional[str]) -> Query:
    """Applique le filtre d'espace : atelier_id précis, ou NULL pour
    l'espace principal quand aucun atelier_id n'est fourni."""
    if atelier_id is None:
        return query.filter(model.atelier_id.is_(None))
    return query.filter(model.atelier_id == atelier_id)
