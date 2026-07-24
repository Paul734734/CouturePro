import enum
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, Date, Float, Text, ForeignKey
from sqlalchemy import Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils import generate_uuid


class Role(str, enum.Enum):
    COUTURIERE = "couturiere"
    ADMIN = "admin"


class StatutUser(str, enum.Enum):
    ESSAI = "essai"
    ACTIF = "actif"
    SUSPENDU = "suspendu"
    EXPIRE = "expire"


class Forfait(str, enum.Enum):
    STARTER = "starter"
    PRO = "pro"
    ELITE = "elite"


class Billing(str, enum.Enum):
    MENSUEL = "mensuel"
    ANNUEL = "annuel"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    nom = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nom_atelier = Column(String(150), nullable=True)
    ville = Column(String(100), nullable=True)
    quartier = Column(String(100), nullable=True)
    telephone = Column(String(30), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(255), nullable=True)
    role = Column(Enum(Role), default=Role.COUTURIERE, nullable=False)

    # ── Abonnement ──────────────────────────────────────────────
    statut = Column(Enum(StatutUser), default=StatutUser.ESSAI, nullable=False)
    forfait = Column(Enum(Forfait), default=Forfait.STARTER, nullable=True)
    billing = Column(Enum(Billing), default=Billing.MENSUEL, nullable=True)

    date_inscription = Column(DateTime, default=datetime.utcnow)
    date_expiration = Column(DateTime, nullable=True)

    reset_token = Column(String(255), nullable=True)
    reset_token_expire = Column(DateTime, nullable=True)

    @property
    def jours_restants(self) -> int:
        if not self.date_expiration:
            return 0
        delta = self.date_expiration - datetime.utcnow()
        return max(delta.days, 0)

    @property
    def statut_effectif(self) -> StatutUser:
        """Recalcule le statut réel en fonction de la date d'expiration,
        au cas où le job de mise à jour n'est pas encore passé.
        essai/actif expirés => 'expire' automatiquement."""
        if self.statut == StatutUser.SUSPENDU:
            return StatutUser.SUSPENDU
        if self.date_expiration and datetime.utcnow() > self.date_expiration:
            return StatutUser.EXPIRE
        return self.statut

    @property
    def abonnement_bloque(self) -> bool:
        return self.statut_effectif in (StatutUser.SUSPENDU, StatutUser.EXPIRE)


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    nom = Column(String(150), nullable=False)
    telephone = Column(String(30), nullable=True)
    ville = Column(String(100), nullable=True)
    quartier = Column(String(100), nullable=True)
    adresse = Column(String(255), nullable=True)
    profession = Column(String(100), nullable=True)
    date_anniversaire = Column(Date, nullable=True)
    style_preference = Column(String(150), nullable=True)
    budget_habituel = Column(Float, nullable=True)
    taille_vetement = Column(String(10), nullable=True)
    hauteur = Column(Float, nullable=True)  # en metres, ex: 1.72
    notes = Column(Text, nullable=True)

    date_ajout = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")


class Mesure(Base):
    __tablename__ = "mesures"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False, index=True)

    poitrine = Column(Float, nullable=True)
    taille = Column(Float, nullable=True)
    hanche = Column(Float, nullable=True)
    longueur_robe = Column(Float, nullable=True)
    manches = Column(Float, nullable=True)
    epaules = Column(Float, nullable=True)
    bras = Column(Float, nullable=True)
    sous_poitrine = Column(Float, nullable=True)
    hauteur_poitrine = Column(Float, nullable=True)
    ecart_poitrine = Column(Float, nullable=True)
    longueur_jupe = Column(Float, nullable=True)
    pantalon = Column(Float, nullable=True)
    notes_morphologie = Column(Text, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow)


class StatutCommande(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    EN_COURS = "en_cours"
    ESSAYAGE = "essayage"
    PRET = "pret"
    LIVRE = "livre"
    ANNULE = "annule"


class Commande(Base):
    __tablename__ = "commandes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False, index=True)

    type_vetement = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    prix_total = Column(Float, default=0)
    avance_paye = Column(Float, default=0)
    reste_a_payer = Column(Float, default=0)

    date_commande = Column(DateTime, default=datetime.utcnow)
    date_essayage = Column(DateTime, nullable=True)
    date_livraison = Column(DateTime, nullable=True)

    statut = Column(Enum(StatutCommande), default=StatutCommande.EN_ATTENTE)
    notes = Column(Text, nullable=True)
    temps_conception = Column(Float, nullable=True)


class TypePaiement(str, enum.Enum):
    AVANCE = "avance"
    SOLDE = "solde"
    PARTIEL = "partiel"


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    commande_id = Column(String(36), ForeignKey("commandes.id"), nullable=False, index=True)

    montant = Column(Float, nullable=False)
    type = Column(Enum(TypePaiement), default=TypePaiement.PARTIEL)
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(String(255), nullable=True)


class TypeDocument(str, enum.Enum):
    FACTURE = "facture"
    RECU = "recu"
    DEVIS = "devis"


class StatutFacture(str, enum.Enum):
    PAYEE = "payee"
    PARTIELLE = "partielle"
    IMPAYEE = "impayee"


class Facture(Base):
    __tablename__ = "factures"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False, index=True)
    commande_id = Column(String(36), ForeignKey("commandes.id"), nullable=True, index=True)

    # figes au moment de l'emission, comme une vraie facture comptable
    cliente_nom = Column(String(150), nullable=False)
    commande_description = Column(String(255), nullable=True)

    numero = Column(String(50), nullable=False)
    type = Column(Enum(TypeDocument), default=TypeDocument.FACTURE)
    statut = Column(Enum(StatutFacture), default=StatutFacture.IMPAYEE)

    montant_total = Column(Float, default=0)
    montant_paye = Column(Float, default=0)
    montant_reste = Column(Float, default=0)

    date_emission = Column(DateTime, default=datetime.utcnow)
    date_echeance = Column(DateTime, nullable=True)

    logo_atelier = Column(String(255), nullable=True)
    nom_atelier = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)

    pdf_path = Column(String(255), nullable=True)
