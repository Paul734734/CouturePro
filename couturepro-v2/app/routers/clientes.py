from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Cliente
from app.schemas import ClienteCreate, ClienteUpdate, ClienteOut
from app.dependencies import require_acces

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])


def _get_cliente_or_404(db: Session, cliente_id: str, user_id: str) -> Cliente:
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.user_id == user_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente introuvable.")
    return cliente


@router.post("", response_model=ClienteOut, status_code=201)
def creer_cliente(
    payload: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("clientes")),
):
    if current_user.forfait:
        from app.acces import calculer_acces
        acces = calculer_acces(current_user)
        max_clientes = acces.get("maxClientes")
        if max_clientes is not None:
            nb_actuel = db.query(Cliente).filter(Cliente.user_id == current_user.id).count()
            if nb_actuel >= max_clientes:
                raise HTTPException(
                    status_code=402,
                    detail=f"Limite de {max_clientes} clientes atteinte pour votre forfait. Passez a un forfait superieur.",
                )

    cliente = Cliente(user_id=current_user.id, **payload.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("", response_model=List[ClienteOut])
def lister_clientes(
    recherche: Optional[str] = Query(None, description="Recherche par nom ou telephone"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("clientes")),
):
    query = db.query(Cliente).filter(Cliente.user_id == current_user.id)
    if recherche:
        like = f"%{recherche}%"
        query = query.filter((Cliente.nom.ilike(like)) | (Cliente.telephone.ilike(like)))
    return query.order_by(Cliente.nom).all()


@router.get("/{cliente_id}", response_model=ClienteOut)
def obtenir_cliente(
    cliente_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("clientes")),
):
    return _get_cliente_or_404(db, cliente_id, current_user.id)


@router.put("/{cliente_id}", response_model=ClienteOut)
def modifier_cliente(
    cliente_id: str,
    payload: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("clientes")),
):
    cliente = _get_cliente_or_404(db, cliente_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cliente, field, value)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}", status_code=204)
def supprimer_cliente(
    cliente_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("clientes")),
):
    cliente = _get_cliente_or_404(db, cliente_id, current_user.id)
    db.delete(cliente)
    db.commit()
