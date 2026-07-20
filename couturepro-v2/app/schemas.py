from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict
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


# ---------- AUTH ----------
class RegisterRequest(CamelModel):
    nom: str
    email: EmailStr
    password: str
    nom_atelier: Optional[str] = None
    ville: Optional[str] = None
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
    telephone: Optional[str] = None
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
    telephone: Optional[str] = None


# ---------- CLIENTES ----------
class ClienteCreate(CamelModel):
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


class MesureCreate(CamelModel):
    cliente_id: str
    poitrine: Optional[float] = None
    taille: Optional[float] = None
    hanche: Optional[float] = None
    longueur_robe: Optional[float] = None
    manches: Optional[float] = None
    epaules: Optional[float] = None
    bras: Optional[float] = None
    sous_poitrine: Optional[float] = None
    hauteur_poitrine: Optional[float] = None
    ecart_poitrine: Optional[float] = None
    longueur_jupe: Optional[float] = None
    pantalon: Optional[float] = None
    notes_morphologie: Optional[str] = None


class MesureUpdate(CamelModel):
    poitrine: Optional[float] = None
    taille: Optional[float] = None
    hanche: Optional[float] = None
    longueur_robe: Optional[float] = None
    manches: Optional[float] = None
    epaules: Optional[float] = None
    bras: Optional[float] = None
    sous_poitrine: Optional[float] = None
    hauteur_poitrine: Optional[float] = None
    ecart_poitrine: Optional[float] = None
    longueur_jupe: Optional[float] = None
    pantalon: Optional[float] = None
    notes_morphologie: Optional[str] = None


class MesureOut(CamelModel):
    id: str
    user_id: str
    cliente_id: str
    poitrine: Optional[float] = None
    taille: Optional[float] = None
    hanche: Optional[float] = None
    longueur_robe: Optional[float] = None
    manches: Optional[float] = None
    epaules: Optional[float] = None
    bras: Optional[float] = None
    sous_poitrine: Optional[float] = None
    hauteur_poitrine: Optional[float] = None
    ecart_poitrine: Optional[float] = None
    longueur_jupe: Optional[float] = None
    pantalon: Optional[float] = None
    notes_morphologie: Optional[str] = None
    updated_at: datetime


class CommandeCreate(CamelModel):
   temps_conception: Optional[float] = None
    cliente_id: str
    type_vetement: str
    description: Optional[str] = None
    prix_total: float = 0
    avance_paye: float = 0
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    statut: StatutCommande = StatutCommande.EN_ATTENTE
    notes: Optional[str] = None


class CommandeUpdate(CamelModel):
   temps_conception: Optional[float] = None
    type_vetement: Optional[str] = None
    description: Optional[str] = None
    prix_total: Optional[float] = None
    avance_paye: Optional[float] = None
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    statut: Optional[StatutCommande] = None
    notes: Optional[str] = None


class CommandeStatutUpdate(CamelModel):
    statut: StatutCommande


class CommandeOut(CamelModel):
   temps_conception: Optional[float] = None
    id: str
    user_id: str
    cliente_id: str
    type_vetement: str
    description: Optional[str] = None
    prix_total: float
    avance_paye: float
    reste_a_payer: float
    date_commande: datetime
    date_essayage: Optional[datetime] = None
    date_livraison: Optional[datetime] = None
    statut: StatutCommande
    notes: Optional[str] = None


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
from app.utils.camel_model import CamelModel

class PaiementOutEnrichi(CamelModel):
    id: str
    commandeId: str
    montant: float
    type: str
    date: datetime
    notes: Optional[str] = None
    clienteNom: Optional[str] = None
    commandeLabel: Optional[str] = None
from datetime import datetime
from typing import Optional
from app.utils.camel_model import CamelModel

class FactureBase(CamelModel):
    commandeId: str
    montant: float
    date: datetime
    notes: Optional[str] = None

class FactureCreate(FactureBase):
    pass

class FactureOut(FactureBase):
    id: str
class StockBase(CamelModel):
    nom: str
    quantite: int
    categorie: str

class StockCreate(StockBase):
    pass

class StockOut(StockBase):
    id: str
class CatalogueBase(CamelModel):
    nom: str
    description: str
    imageUrl: str

class CatalogueCreate(CatalogueBase):
    pass

class CatalogueOut(CatalogueBase):
    id: str
class ProfilBase(CamelModel):
    nomAtelier: str
    description: str
    contact: str
    localisation: str
    logoUrl: str

class ProfilUpdate(ProfilBase):
    pass

class ProfilOut(ProfilBase):
    id: str
class ProfilBase(CamelModel):
    nomAtelier: str
    description: str
    contact: str
    localisation: str
    logoUrl: str

class ProfilUpdate(ProfilBase):
    pass

class ProfilOut(ProfilBase):
    id: str
