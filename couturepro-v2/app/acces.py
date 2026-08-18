from app.models import Forfait, StatutUser

# Source de vérité unique pour les accès par forfait.
# Le frontend (src/store/authStore.ts) ne duplique plus cette logique :
# il consomme directement le champ "acces" renvoyé par l'API (voir routers/auth.py).
# IMPORTANT : si tu modifies un forfait ici, aucune autre synchro n'est nécessaire.
FORFAIT_ACCES = {
    Forfait.STARTER: {
        "clientes": True,
        "mesures": True,
        "commandes": True,
        "commandesPhotos": False,
        "factures": True,
        "paiements": False,
        "multiAtelier": False,
        "exportCompta": False,
        "logoPersonnalise": False,
        "dashboardAvance": False,
        "maxClientes": 30,
    },
    Forfait.PRO: {
        "clientes": True,
        "mesures": True,
        "commandes": True,
        "commandesPhotos": True,
        "factures": True,
        "paiements": True,
        "multiAtelier": False,
        "exportCompta": False,
        "logoPersonnalise": False,
        "dashboardAvance": True,
        "maxClientes": None,
    },
    Forfait.ELITE: {
        "clientes": True,
        "mesures": True,
        "commandes": True,
        "commandesPhotos": True,
        "factures": True,
        "paiements": True,
        "multiAtelier": True,
        "exportCompta": True,
        "logoPersonnalise": True,
        "dashboardAvance": True,
        "maxClientes": None,
    },
}

BLOQUE_ACCES = {
    "clientes": True,
    "mesures": False,
    "commandes": False,
    "commandesPhotos": False,
    "factures": False,
    "paiements": False,
    "multiAtelier": False,
    "exportCompta": False,
    "logoPersonnalise": False,
    "dashboardAvance": False,
    "maxClientes": 0,
}


def calculer_acces(user) -> dict:
    """Reproduit exactement la logique de getAcces() du frontend."""
    statut = user.statut_effectif

    if statut in (StatutUser.ESSAI, StatutUser.ACTIF):
        # L'essai gratuit donne acces aux fonctionnalites du forfait CHOISI
        # (pas un deblocage total) : on decouvre le forfait qu'on a selectionne,
        # pas celui du voisin.
        return FORFAIT_ACCES.get(user.forfait, FORFAIT_ACCES[Forfait.STARTER])
    # suspendu ou expiré => accès minimal (lecture clientes uniquement)
    return BLOQUE_ACCES
