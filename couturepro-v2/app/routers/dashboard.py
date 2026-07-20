from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Cliente, Commande, Paiement, Facture, StatutCommande, StatutFacture
from app.schemas import DashboardStats
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def obtenir_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uid = current_user.id
    now = datetime.utcnow()

    nb_clientes = db.query(Cliente).filter(Cliente.user_id == uid).count()

    commandes_en_cours = db.query(Commande).filter(
        Commande.user_id == uid,
        Commande.statut.in_([StatutCommande.EN_ATTENTE, StatutCommande.EN_COURS, StatutCommande.ESSAYAGE]),
    ).count()

    dans_7_jours = now + timedelta(days=7)
    a_livrer_cette_semaine = db.query(Commande).filter(
        Commande.user_id == uid,
        Commande.date_livraison.isnot(None),
        Commande.date_livraison >= now,
        Commande.date_livraison <= dans_7_jours,
        Commande.statut != StatutCommande.LIVRE,
    ).count()

    debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    paiements_mois = db.query(Paiement).filter(
        Paiement.user_id == uid,
        Paiement.date >= debut_mois,
    ).all()
    paiements_recus_mois = sum(p.montant for p in paiements_mois)

    commandes_actives = db.query(Commande).filter(
        Commande.user_id == uid,
        Commande.statut.notin_([StatutCommande.ANNULE, StatutCommande.LIVRE]),
    ).all()
    reste_a_encaisser = sum(c.reste_a_payer or 0 for c in commandes_actives)

    factures_impayees = db.query(Facture).filter(
        Facture.user_id == uid,
        Facture.statut.in_([StatutFacture.IMPAYEE, StatutFacture.PARTIELLE]),
    ).count()

    return DashboardStats(
        nb_clientes=nb_clientes,
        commandes_en_cours=commandes_en_cours,
        a_livrer_cette_semaine=a_livrer_cette_semaine,
        paiements_recus_mois=paiements_recus_mois,
        reste_a_encaisser=reste_a_encaisser,
        factures_impayees=factures_impayees,
    )
