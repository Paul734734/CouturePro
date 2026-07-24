import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate, formatMontant, getStatutLabel, getStatutColor } from '../../lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCommandesStore } from '@/store/commandesStore'
import { useFacturesStore } from '@/store/facturesStore'

const statutOptions = ['tous', 'en_attente', 'en_cours', 'essayage', 'pret', 'livre', 'annule'] as const

export default function Commandes() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { commandes, fetchCommandes } = useCommandesStore()
  const { factures, fetchFactures, ajouterFacture } = useFacturesStore()
  const [genererFactureId, setGenererFactureId] = useState<string | null>(null)

  const [filtre, setFiltre] = useState<(typeof statutOptions)[number]>('tous')

  useEffect(() => {
    if (user) {
      fetchCommandes()
      fetchFactures()
    }
  }, [user, fetchCommandes, fetchFactures])

  const filtered = useMemo(() => {
    if (filtre === 'tous') return commandes
    return commandes.filter((c) => c.statut === filtre)
  }, [commandes, filtre])

  const getFactureForCommande = (commandeId: string) => factures.find((f) => f.commandeId === commandeId)

  const handleGenererFacture = async (e: { stopPropagation: () => void }, commandeId: string, clienteId: string, prixTotal: number, avancePaye: number) => {
    e.stopPropagation()
    setGenererFactureId(commandeId)
    try {
      const facture = await ajouterFacture({
        clienteId,
        commandeId,
        type: 'facture',
        montantTotal: prixTotal,
        montantPaye: avancePaye,
      })
      navigate(`/factures/${facture.id}`)
    } finally {
      setGenererFactureId(null)
    }
  }

  return (
    <AppLayout titre="Commandes" sousTitre="Suivi et encaissement des commandes">
      <div style={{ maxWidth: 1100 }}>



        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Commandes</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{commandes.length} commandes au total</p>
          </div>
          <button onClick={() => navigate('/commandes/ajouter')} style={{ background: '#C9A227', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            + Nouvelle commande
          </button>
        </div>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {statutOptions.map(s => {
            const color = getStatutColor(s)
            const active = filtre === s
            return (
              <button key={s} onClick={() => setFiltre(s)} style={{ padding: '7px 16px', borderRadius: 50, border: active ? 'none' : '1px solid #e5e0d8', background: active ? '#C9A227' : 'white', color: active ? 'white' : '#555', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
                {s === 'tous' ? 'Toutes' : getStatutLabel(s)}
                <span style={{ marginLeft: 6, background: active ? 'rgba(255,255,255,0.3)' : '#f0ede8', borderRadius: 50, padding: '1px 7px', fontSize: 11 }}>
                  {s === 'tous' ? commandes.length : commandes.filter(c => c.statut === s).length}
                </span>
              </button>
            )
          })}
        </div>

        {/* LISTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => {
                  const sc = getStatutColor(c.statut) as any
                  const progress = Math.round((c.avancePaye / c.prixTotal) * 100)
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/commandes/${c.id}`)}
                className="cp-grid-row-3auto" style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', padding: '20px 24px', cursor: 'pointer', gap: 20 }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(201, 162, 39,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FBF3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#C9A227', flexShrink: 0 }}>
                    {c.clienteNom.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.clienteNom}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{c.typeVetement}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Paiement</div>
                  <div style={{ height: 6, background: '#f0ede8', borderRadius: 3, marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#22c55e' : '#C9A227', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>{formatMontant(c.avancePaye)} / {formatMontant(c.prixTotal)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Livraison</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.dateLivraison ? formatDate(c.dateLivraison) : '—'}</div>
                </div>
                <div className="cp-row-status-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 50, fontWeight: 600, background: '#FBF3DC', color: '#C9A227', whiteSpace: 'nowrap' }}>
                    {getStatutLabel(c.statut)}
                  </span>
                  {(() => {
                    const facture = getFactureForCommande(c.id)
                    if (facture) {
                      return (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/factures/${facture.id}`) }}
                          style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, fontWeight: 600, background: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          🧾 Voir la facture
                        </button>
                      )
                    }
                    return (
                      <button
                        onClick={(e) => handleGenererFacture(e, c.id, c.clienteId, c.prixTotal, c.avancePaye)}
                        disabled={genererFactureId === c.id}
                        style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, fontWeight: 600, background: '#f0ede8', color: '#666', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {genererFactureId === c.id ? 'Génération…' : '🧾 Générer facture'}
                      </button>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>

        {/* MODAL DETAIL et MODAL AJOUT retirées : la navigation se fait désormais
            vers /commandes/:id (détail complet avec facture intégrée) et
            /commandes/ajouter (formulaire complet avec vraie sélection de cliente). */}
      </div>
    </AppLayout>
  )
}
