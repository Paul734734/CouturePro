import { useMemo, useState } from 'react'
import type React from 'react'

import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '@/store/authStore'
import { usePaiementsStore } from '@/store/paiementsStore'
import type { Paiement } from '@/types'

function peutVoirPaiements(forfait?: string, statut?: string): boolean {
  if (statut === 'essai') return true
  if (forfait === 'pro' || forfait === 'elite') return true
  return false
}

type TypePaiementUI = 'avance' | 'solde' | 'paiement_total'

type PaiementDraft = {
  clienteNom: string
  commandeId?: string
  montant: number
  type: TypePaiementUI
  modePaiement: string
  date: string
  note?: string
}

function PaiementsGate() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '60px 32px',
        textAlign: 'center',
        minHeight: 400,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#FFF4ED',
          border: '2px solid #FED7AA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(249,115,22,0.15)',
        }}
      >
        🔒
      </div>

      <div
        style={{
          display: 'inline-block',
          background: '#FFF4ED',
          color: '#F97316',
          padding: '4px 14px',
          borderRadius: 50,
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 14,
          border: '1px solid #FED7AA',
        }}
      >
        FORFAIT PRO REQUIS
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>Suivi des paiements avancé</h3>
      <p style={{ fontSize: 15, color: '#666', maxWidth: 380, margin: '0 0 28px', lineHeight: 1.6 }}>
        Visualisez les dettes en cours, avances reçues et montants à encaisser pour chaque cliente. Disponible à partir du forfait Pro.
      </p>

      <div
        style={{
          background: 'white',
          border: '1px solid #f0ede8',
          borderRadius: 16,
          padding: '18px 24px',
          marginBottom: 28,
          maxWidth: 340,
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#888',
            marginBottom: 10,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
          }}
        >
          Avec le forfait Pro
        </div>
        {[
          'Suivi des avances et restes à payer',
          'Liste des dettes en cours par cliente',
          'Historique complet des paiements',
          'Alertes commandes non soldées',
          'Tableau de bord financier complet',
        ].map((f) => (
          <div key={f} style={{ fontSize: 13, color: '#444', padding: '4px 0', display: 'flex', gap: 8 }}>
            <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
        <Link
          to="/profil"
          style={{
            background: '#F97316',
            color: 'white',
            padding: '13px 28px',
            borderRadius: 50,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Passer au forfait Pro →
        </Link>
        <Link
          to="/dashboard"
          style={{
            background: 'white',
            color: '#555',
            border: '1.5px solid #e5e0d8',
            padding: '12px 24px',
            borderRadius: 50,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

function BanniereEssai({ joursRestants }: { joursRestants: number }) {
  return (
    <div
      style={{
        background: '#FFF4ED',
        border: '1px solid #FED7AA',
        borderRadius: 12,
        padding: '12px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: 10,
      }}
    >
      <span style={{ fontSize: 13, color: '#C2410C', fontWeight: 600 }}>
        🎁 Essai gratuit — {joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''} · Toutes les fonctionnalités débloquées
      </span>
      <Link
        to="/profil"
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 50,
          background: '#F97316',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        Choisir un forfait
      </Link>
    </div>
  )
}

function ModalNouveauPaiement({
  onFermer,
  onEnregistrer,
}: {
  onFermer: () => void
  onEnregistrer: (p: PaiementDraft) => void
}) {
  const [clienteNom, setClienteNom] = useState('')
  const [commandeId, setCommandeId] = useState('')
  const [montant, setMontant] = useState('')
  const [type, setType] = useState<TypePaiementUI>('avance')
  const [modePaiement, setModePaiement] = useState('Espèces')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [erreur, setErreur] = useState('')

  function soumettre() {
    if (!clienteNom.trim()) {
      setErreur('Le nom de la cliente est requis')
      return
    }
    const montantNum = parseFloat(montant)
    if (!montantNum || montantNum <= 0) {
      setErreur('Veuillez saisir un montant valide')
      return
    }

    onEnregistrer({
      clienteNom: clienteNom.trim(),
      commandeId: commandeId.trim() || undefined,
      montant: montantNum,
      type,
      modePaiement,
      date,
      note: note.trim() || undefined,
    })
  }

  const inputStyle = {

    width: '100%',

    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e5e0d8',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const labelStyle: import('react').CSSProperties = {

    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onFermer}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 28,
          maxWidth: 440,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>Nouveau paiement</h3>
          <button
            onClick={onFermer}
            style={{
              background: '#f5f3ef',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: 'pointer',
              color: '#888',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nom de la cliente *</label>
            <input style={inputStyle} placeholder="Ex: Aïcha Mballa" value={clienteNom} onChange={(e) => setClienteNom(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Commande (id, optionnel)</label>
            <input style={inputStyle} placeholder="Ex: <commandeId>" value={commandeId} onChange={(e) => setCommandeId(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Montant (FCFA) *</label>
              <input style={inputStyle} type="number" placeholder="0" value={montant} onChange={(e) => setMontant(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Type de paiement *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: 'avance', label: 'Avance' },
                { val: 'solde', label: 'Solde' },
                { val: 'paiement_total', label: 'Paiement total' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setType(opt.val as TypePaiementUI)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: type === opt.val ? '1.5px solid #F97316' : '1.5px solid #e5e0d8',
                    background: type === opt.val ? '#FFF4ED' : 'white',
                    color: type === opt.val ? '#F97316' : '#666',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Mode de paiement</label>
            <select style={inputStyle} value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}>
              <option>Espèces</option>
              <option>Mobile Money (MTN/Orange)</option>
              <option>Virement bancaire</option>
              <option>Autre</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Note (optionnel)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const }}
              placeholder="Détails supplémentaires..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {erreur && (
            <div style={{ background: '#FEF2F2', color: '#ef4444', fontSize: 13, padding: '10px 14px', borderRadius: 10, fontWeight: 600 }}>
              {erreur}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={onFermer}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 50,
                border: '1.5px solid #e5e0d8',
                background: 'white',
                color: '#555',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              onClick={soumettre}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 50,
                border: 'none',
                background: '#F97316',
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ligneTypeLabel(type: TypePaiementUI) {
  if (type === 'avance') return { texte: 'Avance', couleur: '#F97316', bg: '#FFF4ED' }
  if (type === 'solde') return { texte: 'Solde', couleur: '#22c55e', bg: '#F0FDF4' }
  return { texte: 'Paiement total', couleur: '#3b82f6', bg: '#EFF6FF' }
}

export default function Paiements() {
  const { user } = useAuthStore()
  const accesOk = peutVoirPaiements(user?.forfait, user?.statut)
  const estEssai = user?.statut === 'essai'

  const { getPaiementsByUser, getTotalEncaisseByUser, getSuiviByUser, getTotalResteByUser, ajouterPaiement } = usePaiementsStore()

  const paiements = useMemo(() => (user ? getPaiementsByUser(user.id) : []), [user, getPaiementsByUser])
  const [modalOuvert, setModalOuvert] = useState(false)

  const totalEncaisse = useMemo(() => (user ? getTotalEncaisseByUser(user.id) : 0), [user, getTotalEncaisseByUser])
  const totalReste = useMemo(() => (user ? getTotalResteByUser(user.id) : 0), [user, getTotalResteByUser])

  // Heuristique UI: on estime les avances comme "total payé - reste" sur le suivi.
  // (UI) total avances n’est pas réutilisé; on le garde pour compat éventuelle.
  const totalAvances = useMemo(() => {
    if (!user) return 0
    const suivi = getSuiviByUser(user.id)
    return suivi.reduce((acc, x) => acc + Math.max(0, x.totalPaye ?? 0), 0)
  }, [user, getSuiviByUser])


  const formatFCFA = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`

  const onEnregistrer = (p: PaiementDraft) => {
    if (!user) return

    const typeStore: Paiement['type'] = p.type === 'paiement_total' ? 'partiel' : p.type

    ajouterPaiement(
      {
        commandeId: p.commandeId ?? '',
        montant: p.montant,
        type: typeStore,
        date: p.date,
        notes: p.note,
      } as any,
      user.id,
      p.clienteNom,
      p.commandeId || 'Commande'
    )

    setModalOuvert(false)
  }

  return (
    <AppLayout titre="Suivi des paiements" sousTitre="Visualisez avances, dettes et restes à encaisser">
      <div style={{ maxWidth: 1400 }}>
        {estEssai && <BanniereEssai joursRestants={user?.joursRestants ?? 7} />}

        {!accesOk ? (
          <PaiementsGate />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <button
                onClick={() => setModalOuvert(true)}
                style={{
                  background: '#F97316',
                  color: 'white',
                  border: 'none',
                  padding: '13px 24px',
                  borderRadius: 50,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 16px rgba(249,115,22,0.25)',
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> Nouveau paiement
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total encaissé', valeur: formatFCFA(totalEncaisse), sub: 'Ce mois', couleur: '#22c55e', icon: '✅' },
                { label: 'Avances reçues', valeur: formatFCFA(Math.max(0, totalAvances)), sub: 'En attente de solde', couleur: '#F97316', icon: '💰' },

                { label: 'Restes à encaisser', valeur: formatFCFA(totalReste), sub: 'Commandes non soldées', couleur: '#ef4444', icon: '⏳' },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: '20px',
                    border: '1px solid #f0ede8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{k.icon}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{k.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: k.couleur }}>{k.valeur}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {paiements.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid #f0ede8',
                  padding: 60,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Aucun paiement enregistré</h3>
                <p style={{ fontSize: 14, color: '#888', maxWidth: 320, margin: '0 0 24px', lineHeight: 1.6 }}>
                  Les paiements apparaîtront ici dès que vous enregistrez une avance ou un solde sur une commande.
                </p>
                <button
                  onClick={() => setModalOuvert(true)}
                  style={{
                    background: '#F97316',
                    color: 'white',
                    border: 'none',
                    padding: '13px 28px',
                    borderRadius: 50,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Nouveau paiement
                </button>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f0ede8', overflow: 'hidden' }}>
                {paiements.map((p, idx) => {
                  // Le store n’a pas le champ 'modePaiement' dans le type Paiement: on réutilise au rendu via extension si existante.
                  const uiType: TypePaiementUI = p.type === 'partiel' ? 'paiement_total' : (p.type as any)
                  const tl = ligneTypeLabel(uiType)

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 24px',
                        gap: 12,
                        borderBottom: idx < paiements.length - 1 ? '1px solid #f5f3ef' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{p.clienteNom}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {p.commandeLabel ? `${p.commandeLabel} · ` : ''}
                          {p.type === 'avance' ? 'Avance' : p.type === 'solde' ? 'Solde' : 'Paiement total'} · {new Date(p.date).toLocaleDateString('fr-FR')}
                        </div>
                        {p.notes && <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>{p.notes}</div>}
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>{formatFCFA(p.montant)}</div>
                        <div
                          style={{
                            display: 'inline-block',
                            marginTop: 4,
                            background: tl.bg,
                            color: tl.couleur,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 10px',
                            borderRadius: 50,
                          }}
                        >
                          {tl.texte}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {modalOuvert && <ModalNouveauPaiement onFermer={() => setModalOuvert(false)} onEnregistrer={onEnregistrer} />}
    </AppLayout>
  )
}

