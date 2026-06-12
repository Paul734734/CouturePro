import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useCommandesStore } from '../../store/commandesStore'
import { useClientesStore } from '../../store/clientesStore'
import { usePaiementsStore } from '../../store/paiementsStore'

const STATUTS = [
  { value: 'en_attente', label: 'En attente', bg: '#fef9c3', color: '#854d0e' },
  { value: 'en_cours', label: 'En cours', bg: '#dbeafe', color: '#1e40af' },
  { value: 'essayage', label: 'Essayage', bg: '#f3e8ff', color: '#6b21a8' },
  { value: 'pret', label: 'Prêt', bg: '#dcfce7', color: '#14532d' },
  { value: 'livre', label: 'Livré', bg: '#f3f4f6', color: '#374151' },
  { value: 'annule', label: 'Annulé', bg: '#fee2e2', color: '#991b1b' },
]

export default function CommandeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCommandeById, modifierCommande, supprimerCommande } = useCommandesStore()
  const { getClienteById } = useClientesStore()
  const { ajouterPaiement, getPaiementsByCommande } = usePaiementsStore()

  const commande = id ? getCommandeById(id) : undefined
  const [showEncaisser, setShowEncaisser] = useState(false)
  const [montantEncaisse, setMontantEncaisse] = useState('')
  const [modePaiement, setModePaiement] = useState('especes')
  const [showSupprimerConfirm, setShowSupprimerConfirm] = useState(false)
  const [loadingPaiement, setLoadingPaiement] = useState(false)

  if (!commande) {
    return (
      <AppLayout titre="Commande introuvable">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h2 style={{ color: '#1a1a1a' }}>Commande introuvable</h2>
          <button
            onClick={() => navigate('/commandes')}
            style={{
              background: '#F97316', color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px 28px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Retour aux commandes
          </button>
        </div>
      </AppLayout>
    )
  }

  const cliente = getClienteById(commande.clienteId)
  const paiements = getPaiementsByCommande(id!) || []
  const statut = STATUTS.find((s) => s.value === commande.statut) || STATUTS[0]
  const resteAPayer = (commande.prixTotal || 0) - (commande.avancePaye || 0)
  const progression = commande.prixTotal > 0 ? Math.round((commande.avancePaye / commande.prixTotal) * 100) : 0

  const handleChangerStatut = (newStatut: string) => {
    modifierCommande(id!, { statut: newStatut })
  }

  const handleEncaisser = async () => {
    const montant = Number(montantEncaisse)
    if (!montant || montant <= 0) return
    if (montant > resteAPayer) return
    setLoadingPaiement(true)
    await new Promise((r) => setTimeout(r, 300))
    const nouvelleAvance = (commande.avancePaye || 0) + montant
    const nouveauReste = (commande.prixTotal || 0) - nouvelleAvance
    modifierCommande(id!, {
      avancePaye: nouvelleAvance,
      resteAPayer: nouveauReste,
      statut: nouveauReste === 0 ? 'livre' : commande.statut,
    })
    ajouterPaiement(
      {
        commandeId: id!,
        montant,
        modePaiement: modePaiement as any,
        note: '',
      },
      commande.userId,
      cliente?.nom || '',
      commande.typeVetement || ''
    )
    setShowEncaisser(false)
    setMontantEncaisse('')
    setLoadingPaiement(false)
  }

  const handleSupprimer = () => {
    supprimerCommande(id!)
    navigate('/commandes')
  }

  return (
    <AppLayout titre="Détail commande">
      <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}
          >
            ← Retour
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
                {commande.typeVetement || 'Commande'}
              </h1>
              {cliente && (
                <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                  👤 {cliente.nom} · {cliente.ville}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to={`/commandes/${id}/modifier`}
                style={{
                  background: '#fff', color: '#F97316', border: '1px solid #F97316',
                  textDecoration: 'none', borderRadius: 10, padding: '9px 16px',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                ✏️ Modifier
              </Link>
              <button
                onClick={() => setShowSupprimerConfirm(true)}
                style={{
                  background: '#fff', color: '#ef4444', border: '1px solid #fca5a5',
                  borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16,
          padding: '24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{
              background: statut.bg, color: statut.color,
              borderRadius: 20, padding: '6px 16px', fontWeight: 700, fontSize: 13,
            }}>
              {statut.label}
            </span>
            <span style={{ color: '#aaa', fontSize: 13 }}>
              📅 {commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString('fr-FR') : '—'}
            </span>
          </div>

          {commande.photoModele && (
            <div style={{ marginBottom: 20 }}>
              <img
                src={commande.photoModele}
                alt="Modèle"
                style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 10 }}
              />
            </div>
          )}

          {commande.description && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FAFAF8', borderRadius: 10 }}>
              <p style={{ color: '#555', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{commande.description}</p>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Progression du paiement</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>{progression}%</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 99, height: 10, overflow: 'hidden' }}>
              <div style={{
                width: `${progression}%`, height: '100%',
                background: progression === 100 ? '#16a34a' : '#F97316',
                borderRadius: 99, transition: 'width 0.3s',
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Prix total', val: `${Number(commande.prixTotal || 0).toLocaleString()} FCFA`, color: '#1a1a1a' },
              { label: 'Payé', val: `${Number(commande.avancePaye || 0).toLocaleString()} FCFA`, color: '#16a34a' },
              { label: 'Reste', val: `${resteAPayer.toLocaleString()} FCFA`, color: resteAPayer > 0 ? '#F97316' : '#16a34a' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#FAFAF8', borderRadius: 10, padding: '12px', textAlign: 'center',
                border: '1px solid #f0f0f0',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
          padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '0 0 14px', textTransform: 'uppercase' }}>
            📅 Dates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Commande', val: commande.dateCommande },
              { label: 'Essayage', val: commande.dateEssayage },
              { label: 'Livraison', val: commande.dateLivraison },
            ].map((d) => (
              <div key={d.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: d.val ? '#1a1a1a' : '#ccc' }}>
                  {d.val ? new Date(d.val).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
          padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '0 0 14px', textTransform: 'uppercase' }}>
            📌 Changer le statut
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATUTS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleChangerStatut(s.value)}
                type="button"
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: commande.statut === s.value ? 'none' : '1px solid #e5e5e5',
                  background: commande.statut === s.value ? s.bg : '#fff',
                  color: commande.statut === s.value ? s.color : '#888',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {paiements.length > 0 && (
          <div style={{
            background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
            padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '0 0 14px', textTransform: 'uppercase' }}>
              💳 Historique des paiements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paiements.map((p) => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: '#f0fdf4', borderRadius: 8,
                }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>
                      +{Number(p.montant).toLocaleString()} FCFA
                    </span>
                    <span style={{ fontSize: 12, color: '#888', marginLeft: 10 }}>{p.modePaiement}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa' }}>
                    {new Date(p.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {resteAPayer > 0 && (
          <button
            onClick={() => setShowEncaisser(true)}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: '#F97316', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', marginBottom: 12,
            }}
          >
            💰 Encaisser un paiement ({resteAPayer.toLocaleString()} FCFA restants)
          </button>
        )}

        {resteAPayer === 0 && (
          <div style={{
            background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12,
            padding: '14px', textAlign: 'center', marginBottom: 12,
          }}>
            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 15 }}>
              ✅ Commande entièrement payée
            </span>
          </div>
        )}

        {showEncaisser && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
          }}>
            <div style={{
              background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px',
              width: '100%', maxWidth: 500,
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
                💰 Encaisser un paiement
              </h3>
              <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                Reste à payer : <strong style={{ color: '#F97316' }}>{resteAPayer.toLocaleString()} FCFA</strong>
              </p>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                Montant encaissé (FCFA)
              </label>
              <input
                type="number"
                value={montantEncaisse}
                onChange={(e) => setMontantEncaisse(e.target.value)}
                placeholder={`Max: ${resteAPayer.toLocaleString()}`}
                max={resteAPayer}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 16,
                  border: '1.5px solid #e5e5e5', outline: 'none', background: '#FAFAF8',
                  boxSizing: 'border-box', marginBottom: 14, fontWeight: 700, color: '#1a1a1a',
                }}
              />

              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>
                Mode de paiement
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { val: 'especes', label: '💵 Espèces' },
                  { val: 'momo', label: '📱 MoMo' },
                  { val: 'orange_money', label: '🟠 Orange Money' },
                  { val: 'virement', label: '🏦 Virement' },
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => setModePaiement(m.val)}
                    type="button"
                    style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: modePaiement === m.val ? 'none' : '1px solid #e5e5e5',
                      background: modePaiement === m.val ? '#F97316' : '#fff',
                      color: modePaiement === m.val ? '#fff' : '#555',
                      cursor: 'pointer',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowEncaisser(false)}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 10, border: '1px solid #e5e5e5',
                    background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleEncaisser}
                  disabled={loadingPaiement || !montantEncaisse || Number(montantEncaisse) <= 0}
                  style={{
                    flex: 2, padding: '13px', borderRadius: 10, border: 'none',
                    background: loadingPaiement ? '#fbd0b0' : '#F97316', color: '#fff',
                    fontWeight: 700, cursor: 'pointer', fontSize: 15,
                  }}
                >
                  {loadingPaiement ? 'Enregistrement...' : '✅ Confirmer le paiement'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSupprimerConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              maxWidth: 380, width: '100%', textAlign: 'center',
            }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Supprimer cette commande ?</h3>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Action irréversible.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowSupprimerConfirm(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e5e5',
                    background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSupprimer}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                    background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
