from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
from app.models import Role, StatutUser, Forfait, Billing, StatutCommande, TypePaiement, TypeDocument, StatutFacture


def to_camel(snake_str: str) -> str:
    parts = snake_str.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    """Base commune : accepte et renvoie du camelCase (comme les types TS du front)
    tout en gardant du snake_case propre côté Python."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    @model_validator(mode="before")
    @classmethod
    def _chaine_vide_devient_none(cls, data):
        # Les formulaires du frontend envoient souvent "" (pas absent) pour un
        # champ optionnel laisse vide (date, nombre...). Pydantic rejette ""
        # pour tout type non-str avec un 422 que le frontend n'affichait pas
        # (ex: creation de commande silencieusement en echec si la date
        # d'essayage/livraison est vide). On neutralise "" -> None une seule
        # fois ici plutot que champ par champ dans chaque schema.
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data


# ---------- AUTH ----------
class RegisterRequest(CamelModel):
    nom: str
    email: EmailStr
    password: str
    nom_atelier: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None
    forfait: Forfait = Forfait.STARTER
    billing: Billing = Billing.MENSUEL


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    token: str
    new_password: str


class UserOut(CamelModel):
    id: str
    nom: str
    email: EmailStr
    nom_atelier: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    role: Role
    statut: StatutUser
    forfait: Optional[Forfait] = None
    billing: Optional[Billing] = None
    date_inscription: datetime
    date_expiration: Optional[datetime] = None
    jours_restants: int = 0


class LoginResponse(CamelModel):
    user: UserOut
    token: str
    acces: Dict[str, Any]


class MeResponse(CamelModel):
    user: UserOut
    acces: Dict[str, Any]


class UpdateProfilRequest(CamelModel):
    nom: Optional[str] = None
    nom_atelier: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None


# ---------- CLIENTES ----------
class ClienteCreate(CamelModel):
    atelier_id: Optional[str] = None
    nom: str
    telephone: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    adresse: Optional[str] = None
    profession: Optional[str] = None
    date_anniversaire: Optional[date] = None
    style_preference: Optional[str] = None
    budget_habituel: Optional[float] = None
    taille_vetement: Optional[str] = None
    hauteur: Optional[float] = None
    notes: Optional[str] = None


class ClienteUpdate(CamelModel):
    atelier_id: Optional[str] = None
    nom: Optional[str] = None
    telephone: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    adresse: Optional[str] = None
    profession: Optional[str] = None
    date_anniversaire: Optional[date] = None
    style_preference: Optional[str] = None
    budget_habituel: Optional[float] = None
    taille_vetement: Optional[str] = None
    hauteur: Optional[float] = None
    notes: Optional[str] = None


class ClienteOut(CamelModel):
    id: str
    user_id: str
    atelier_id: Optional[str] = None
    nom: str
    telephone: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    adresse: Optional[str] = None
    profession: Optional[str] = None
    date_anniversaire: Optional[date] = None
    style_preference: Optional[str] = None
    budget_habituel: Optional[float] = None
    taille_vetement: Optional[str] = None
    hauteur: Optional[float] = None
    notes: Optional[str] = None
    date_ajout: datetime


class MesureChampsMixin(CamelModel):
    # Tete et cou
    tour_tete: Optional[float] = None
    tour_cou: Optional[float] = None
    hauteur_cou: Optional[float] = None
    # Epaules et buste
    largeur_epaules: Optional[float] = None
    longueur_epaule: Optional[float] = None
    tour_poitrine: Optional[float] = None
    tour_sous_poitrine: Optional[float] = None
    ecart_poitrine: Optional[float] = None
    hauteur_poitrine: Optional[float] = None
    tour_carrure_dos: Optional[float] = None
    tour_carrure_devant: Optional[float] = None
    # Dos et longueur de buste
    longueur_dos: Optional[float] = None
    longueur_taille_devant: Optional[float] = None
    longueur_taille_hanches: Optional[float] = None
    # Taille et hanches
    tour_taille: Optional[float] = None
    tour_hanches: Optional[float] = None
    hauteur_taille: Optional[float] = None
    tour_ventre: Optional[float] = None
    # Bras
    tour_bras: Optional[float] = None
    tour_coude: Optional[float] = None
    tour_poignet: Optional[float] = None
    longueur_bras: Optional[float] = None
    longueur_epaule_coude: Optional[float] = None
    longueur_coude_poignet: Optional[float] = None
    # Jambes
    tour_cuisse: Optional[float] = None
    tour_genou: Optional[float] = None
    tour_mollet: Optional[float] = None
    tour_cheville: Optional[float] = None
    longueur_entrejambe: Optional[float] = None
    longueur_totale_jambe: Optional[float] = None
    hauteur_genou: Optional[float] = None
    # Longueurs generales
    hauteur_totale: Optional[float] = None
    longueur_totale_vetement: Optional[float] = None
    longueur_jupe_pantalon: Optional[float] = None
    # Mesures specifiques optionnelles
    tour_tete_capuche: Optional[float] = None
    profondeur_emmanchure: Optional[float] = None
    largeur_dos_taille: Optional[float] = None

    notes_morphologie: Optional[str] = None


class MesureCreate(MesureChampsMixin):
    cliente_id: str


class MesureUpdate(MesureChampsMixin):
    pass


class MesureOut(MesureChampsMixin):
    id: str
    user_id: str
    cliente_id: str
    updated_at: datetime


class CommandeCreate(CamelModel):
    cliente_id: str
    atelier_id: Optional[str] = None
    type_vetement: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    prix_total: float = 0
    avance_paye: float = 0
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    mode_livraison: Optional[str] = "retrait_atelier"
    prix_livraison: Optional[float] = 0
    adresse_livraison: Optional[str] = None
    statut: StatutCommande = StatutCommande.EN_ATTENTE
    notes: Optional[str] = None
    temps_conception: Optional[float] = None


class CommandeUpdate(CamelModel):
    type_vetement: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    prix_total: Optional[float] = None
    avance_paye: Optional[float] = None
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    mode_livraison: Optional[str] = None
    prix_livraison: Optional[float] = None
    adresse_livraison: Optional[str] = None
    statut: Optional[StatutCommande] = None
    notes: Optional[str] = None
    temps_conception: Optional[float] = None


class CommandeStatutUpdate(CamelModel):
    statut: StatutCommande


class CommandeOut(CamelModel):
    id: str
    user_id: str
    atelier_id: Optional[str] = None
    cliente_id: str
    cliente_nom: Optional[str] = None
    type_vetement: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    prix_total: float
    avance_paye: float
    reste_a_payer: float
    date_commande: datetime
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    mode_livraison: Optional[str] = None
    prix_livraison: Optional[float] = None
    adresse_livraison: Optional[str] = None
    statut: StatutCommande
    notes: Optional[str] = None
    temps_conception: Optional[float] = None


class PaiementCreate(CamelModel):
    commande_id: str
    montant: float
    type: TypePaiement = TypePaiement.PARTIEL
    notes: Optional[str] = None


class PaiementOut(CamelModel):
    id: str
    user_id: str
    commande_id: str
    montant: float
    type: TypePaiement
    date: datetime
    notes: Optional[str] = None


class PaiementEnrichiOut(CamelModel):
    id: str
    user_id: str
    commande_id: str
    montant: float
    type: TypePaiement
    date: datetime
    notes: Optional[str] = None
    cliente_nom: str
    commande_label: str


class SuiviPaiementOut(CamelModel):
    commande_id: str
    cliente_nom: str
    commande_label: str
    prix_total: float
    total_paye: float
    reste_a_payer: float
    statut: str


class TotauxPaiementsOut(CamelModel):
    total_encaisse: float
    total_reste: float


class FactureCreate(CamelModel):
    cliente_id: str
    commande_id: Optional[str] = None
    type: TypeDocument = TypeDocument.FACTURE
    montant_total: float = 0
    montant_paye: float = 0
    date_echeance: Optional[datetime] = None
    notes: Optional[str] = None


class FactureOut(CamelModel):
    id: str
    user_id: str
    cliente_id: str
    commande_id: Optional[str] = None
    cliente_nom: str
    commande_description: Optional[str] = None
    numero: str
    type: TypeDocument
    statut: StatutFacture
    montant_total: float
    montant_paye: float
    montant_reste: float
    date_emission: datetime
    date_echeance: Optional[datetime] = None
    logo_atelier: Optional[str] = None
    nom_atelier: Optional[str] = None
    notes: Optional[str] = None


class DashboardStats(CamelModel):
    nb_clientes: int
    commandes_en_cours: int
    a_livrer_cette_semaine: int
    paiements_recus_mois: float
    reste_a_encaisser: float
    factures_impayees: int


class AdminUserOut(CamelModel):
    id: str
    nom: str
    email: EmailStr
    nom_atelier: Optional[str] = None
    ville: Optional[str] = None
    telephone: Optional[str] = None
    role: Role
    statut: StatutUser
    forfait: Optional[Forfait] = None
    billing: Optional[Billing] = None
    date_inscription: datetime
    date_expiration: Optional[datetime] = None
    jours_restants: int = 0
    abonnement_bloque: bool = False


class AdminUserUpdate(CamelModel):
    statut: Optional[StatutUser] = None
    forfait: Optional[Forfait] = None
    billing: Optional[Billing] = None
    date_expiration: Optional[datetime] = None


class AdminDashboardStats(CamelModel):
    nb_utilisatrices_total: int
    nb_utilisatrices_actives: int
    nb_utilisatrices_essai: int
    nb_utilisatrices_expirees: int
    nb_utilisatrices_suspendues: int
    revenus_estimes_mensuel: float
from datetime import datetime
from typing import Optional

class PaiementOutEnrichi(CamelModel):
    id: str
    commandeId: str
    montant: float
    type: str
    date: datetime
    notes: Optional[str] = None
    clienteNom: Optional[str] = None
    commandeLabel: Optional[str] = None


# ---------- STOCK ----------
class ArticleStockCreate(CamelModel):
    atelier_id: Optional[str] = None
    nom: str
    categorie: Optional[str] = None
    quantite: float = 0
    unite: str = "unite"
    seuil_alerte: Optional[float] = None
    prix_unitaire: Optional[float] = None
    fournisseur: Optional[str] = None
    notes: Optional[str] = None


class ArticleStockUpdate(CamelModel):
    nom: Optional[str] = None
    categorie: Optional[str] = None
    quantite: Optional[float] = None
    unite: Optional[str] = None
    seuil_alerte: Optional[float] = None
    prix_unitaire: Optional[float] = None
    fournisseur: Optional[str] = None
    notes: Optional[str] = None


class ArticleStockOut(CamelModel):
    id: str
    user_id: str
    atelier_id: Optional[str] = None
    nom: str
    categorie: Optional[str] = None
    quantite: float
    unite: str
    seuil_alerte: Optional[float] = None
    prix_unitaire: Optional[float] = None
    fournisseur: Optional[str] = None
    notes: Optional[str] = None
    date_ajout: datetime
    date_maj: datetime


# ---------- CATALOGUE ----------
class ArticleCatalogueCreate(CamelModel):
    atelier_id: Optional[str] = None
    nom: str
    categorie: Optional[str] = None
    description: Optional[str] = None
    prix_indicatif: Optional[float] = None
    temps_conception_estime: Optional[float] = None
    image_url: Optional[str] = None
    actif: bool = True


class ArticleCatalogueUpdate(CamelModel):
    nom: Optional[str] = None
    categorie: Optional[str] = None
    description: Optional[str] = None
    prix_indicatif: Optional[float] = None
    temps_conception_estime: Optional[float] = None
    image_url: Optional[str] = None
    actif: Optional[bool] = None


class ArticleCatalogueOut(CamelModel):
    id: str
    user_id: str
    atelier_id: Optional[str] = None
    nom: str
    categorie: Optional[str] = None
    description: Optional[str] = None
    prix_indicatif: Optional[float] = None
    temps_conception_estime: Optional[float] = None
    image_url: Optional[str] = None
    actif: bool
    date_ajout: datetime


# ── Ateliers (multi-atelier, forfait Elite) ────────────────────────────
class AtelierCreate(CamelModel):
    nom: str
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None


class AtelierUpdate(CamelModel):
    nom: Optional[str] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None


class AtelierOut(CamelModel):
    id: str
    user_id: str
    nom: str
    ville: Optional[str] = None
    quartier: Optional[str] = None
    telephone: Optional[str] = None
    created_at: datetime
