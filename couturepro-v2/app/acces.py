from app.models import Forfait, StatutUser

# Copie exacte de FORFAIT_ACCES dans src/store/authStore.ts
# IMPORTANT : si tu modifies un forfait côté frontend, modifie ici aussi.
FORFAIT_ACCES = {
    Forfait.STARTER: {
        "clientes": True,
        "mesures": True,
        "commandes": True,
        "commandesPhotos": False,
        "factures": False,
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

ESSAI_ACCES = {
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

    if statut == StatutUser.ESSAI:
        return ESSAI_ACCES
    if statut != StatutUser.ACTIF:
        # suspendu ou expiré => accès minimal (lecture clientes uniquement)
        return BLOQUE_ACCES
    return FORFAIT_ACCES.get(user.forfait, FORFAIT_ACCES[Forfait.STARTER])
