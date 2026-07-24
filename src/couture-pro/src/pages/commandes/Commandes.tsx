import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate, formatMontant, getStatutLabel, getStatutColor } from '../../lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCommandesStore } from '@/store/commandesStore'


const statutOptions = ['tous', 'en_attente', 'en_cours', 'essayage', 'pret', 'livre', 'annule'] as const

export default function Commandes() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { commandes, fetchCommandes } = useCommandesStore()

  const [filtre, setFiltre] = useState<(typeof statutOptions)[number]>('tous')

  useEffect(() => { if (user) fetchCommandes() }, [user, fetchCommandes])
  const filtered = useMemo(() => {
    if (filtre === 'tous') return commandes
    return commandes.filter((c) => c.statut === filtre)
  }, [commandes, filtre])

  return (
    <AppLayout titre="Commandes" sousTitre="Suivi et encaissement des commandes">
      <div style={{ maxWidth: 1100 }}>



        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Commandes</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{commandes.length} commandes au total</p>
          </div>
          <button onClick={() => navigate('/commandes/ajouter')} style={{ background: '#F97316', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            + Nouvelle commande
          </button>
        </div>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {statutOptions.map(s => {
            const color = getStatutColor(s)
            const active = filtre === s
            return (
              <button key={s} onClick={() => setFiltre(s)} style={{ padding: '7px 16px', borderRadius: 50, border: active ? 'none' : '1px solid #e5e0d8', background: active ? '#F97316' : 'white', color: active ? 'white' : '#555', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
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
                style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', padding: '20px 24px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 20, alignItems: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#F97316', flexShrink: 0 }}>
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
                    <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#22c55e' : '#F97316', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>{formatMontant(c.avancePaye)} / {formatMontant(c.prixTotal)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Livraison</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.dateLivraison ? formatDate(c.dateLivraison) : '—'}</div>
                </div>
                <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 50, fontWeight: 600, background: '#FFF4ED', color: '#F97316', whiteSpace: 'nowrap' }}>
                  {getStatutLabel(c.statut)}
                </span>
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
