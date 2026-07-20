import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.models import User, Role, StatutUser, Forfait, Billing
from app.acces import calculer_acces, ESSAI_ACCES, BLOQUE_ACCES


def make_user(**kwargs):
    defaults = dict(
        id="u1", nom="Test", email="t@t.com", password_hash="x",
        role=Role.COUTURIERE, statut=StatutUser.ACTIF, forfait=Forfait.PRO,
        billing=Billing.MENSUEL, date_expiration=datetime.utcnow() + timedelta(days=10),
    )
    defaults.update(kwargs)
    return User(**defaults)


def test_essai_debloque_tout():
    user = make_user(statut=StatutUser.ESSAI)
    assert calculer_acces(user) == ESSAI_ACCES


def test_starter_bloque_factures_et_limite_clientes():
    user = make_user(statut=StatutUser.ACTIF, forfait=Forfait.STARTER)
    acces = calculer_acces(user)
    assert acces["factures"] is False
    assert acces["paiements"] is False
    assert acces["maxClientes"] == 30


def test_pro_debloque_factures_sans_limite():
    user = make_user(statut=StatutUser.ACTIF, forfait=Forfait.PRO)
    acces = calculer_acces(user)
    assert acces["factures"] is True
    assert acces["maxClientes"] is None


def test_elite_debloque_multi_atelier():
    user = make_user(statut=StatutUser.ACTIF, forfait=Forfait.ELITE)
    acces = calculer_acces(user)
    assert acces["multiAtelier"] is True
    assert acces["exportCompta"] is True


def test_suspendu_bloque_tout_sauf_clientes():
    user = make_user(statut=StatutUser.SUSPENDU)
    assert calculer_acces(user) == BLOQUE_ACCES


def test_statut_effectif_bascule_en_expire_automatiquement():
    user = make_user(statut=StatutUser.ACTIF, date_expiration=datetime.utcnow() - timedelta(days=1))
    assert user.statut_effectif == StatutUser.EXPIRE


def test_statut_suspendu_reste_prioritaire_meme_si_pas_expire():
    user = make_user(statut=StatutUser.SUSPENDU, date_expiration=datetime.utcnow() + timedelta(days=30))
    assert user.statut_effectif == StatutUser.SUSPENDU


def test_jours_restants_ne_devient_jamais_negatif():
    user = make_user(date_expiration=datetime.utcnow() - timedelta(days=5))
    assert user.jours_restants == 0


def test_jours_restants_compte_correctement():
    user = make_user(date_expiration=datetime.utcnow() + timedelta(days=6, hours=23))
    assert user.jours_restants == 6
