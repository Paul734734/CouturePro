import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate, formatMontant, getStatutLabel, getStatutColor } from '../../lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCommandesStore } from '@/store/commandesStore'
import type { Commande } from '@/types'


const statutOptions = ['tous', 'en_attente', 'en_cours', 'essayage', 'pret', 'livre', 'annule'] as const

export default function Commandes() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { commandes, fetchCommandes, ajouterCommande, modifierCommande, changerStatut } = useCommandesStore()

  // UI state (sinon => ReferenceError: selected is not defined)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState<{[k: string]: any}>({
    clienteNom: '',
    typeVetement: '',
    description: '',
    prixTotal: '',
    avancePaye: '',
    dateLivraison: '',
    dateEssayage: '',
  })

  const inputStyle: CSSProperties = {

    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e5e0d8',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  const labelStyle: CSSProperties = {

    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    marginBottom: 6,
    display: 'block',
  }

  const handleSubmit = () => {
    if (!user) return

    const prixTotal = Number(form.prixTotal)
    const avancePaye = Number(form.avancePaye) || 0

    if (!String(form.clienteNom || '').trim()) return
    if (!String(form.typeVetement || '').trim()) return
    if (!prixTotal || prixTotal <= 0) return

    ajouterCommande(
      {
        clienteId: '',
        clienteNom: String(form.clienteNom).trim(),
        typeVetement: String(form.typeVetement).trim(),
        description: String(form.description || '').trim(),
        prixTotal,
        avancePaye,
        dateCommande: new Date().toISOString(),
        dateEssayage: form.dateEssayage || undefined,
        dateLivraison: form.dateLivraison || undefined,
        statut: 'en_attente',
        notes: '',
        resteAPayer: Math.max(0, prixTotal - avancePaye),
      } as any,
      user.id,
    )

    setShowForm(false)
    setForm({
      clienteNom: '',
      typeVetement: '',
      description: '',
      prixTotal: '',
      avancePaye: '',
      dateLivraison: '',
      dateEssayage: '',
    })
  }

  const updateStatut = (commandeId: string, s: any) => {
    if (!commandeId) return
    // store: changerStatut
    changerStatut(commandeId, s)
    // keep selected in sync
    setSelected((prev: any) => (prev && prev.id === commandeId ? { ...prev, statut: s } : prev))
  }

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
          <button onClick={() => setShowForm(true)} style={{ background: '#F97316', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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

        {/* MODAL DETAIL */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Détail commande</h3>

                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: 16, background: '#FAFAF8', borderRadius: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#F97316' }}>{selected.clienteNom.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.clienteNom}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{selected.typeVetement}</div>
                </div>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 50,
                    fontWeight: 600,
                    background: (getStatutColor(selected.statut) as any).bg,
                    color: (getStatutColor(selected.statut) as any).color,
                  }}
                >
                  {getStatutLabel(selected.statut)}
                </span>
              </div>
              {[
                ['📝 Description', selected.description],
                ['💰 Prix total', formatMontant(selected.prixTotal)],
                ['✅ Avance payée', formatMontant(selected.avancePaye)],
                ['⏳ Reste à payer', formatMontant(selected.resteAPayer)],
                ['📅 Date commande', formatDate(selected.dateCommande)],
                ['🧵 Essayage', selected.dateEssayage ? formatDate(selected.dateEssayage) : '—'],
                ['🚚 Livraison', selected.dateLivraison ? formatDate(selected.dateLivraison) : '—'],
              ].map(([l, v]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0ede8', fontSize: 14 }}>
                  <span style={{ color: '#888' }}>{l as string}</span>
                  <span style={{ fontWeight: 600 }}>{v as string}</span>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>Changer le statut :</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(['en_attente', 'en_cours', 'essayage', 'pret', 'livre'] as Commande['statut'][]).map(s => (
                    <button key={s} onClick={() => updateStatut(selected.id, s)} style={{ padding: '7px 14px', borderRadius: 50, border: selected.statut === s ? 'none' : '1px solid #e5e0d8', background: selected.statut === s ? '#F97316' : 'white', color: selected.statut === s ? 'white' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {getStatutLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT */}
        {showForm && (
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Nouvelle commande</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'clienteNom', label: 'Nom cliente *', placeholder: 'Aminata Diallo', full: true },
                  { key: 'typeVetement', label: 'Type de vêtement *', placeholder: 'Robe ankara', full: true },
                  { key: 'prixTotal', label: 'Prix total (FCFA) *', placeholder: '35000', full: false },
                  { key: 'avancePaye', label: 'Avance payée (FCFA)', placeholder: '15000', full: false },
                  { key: 'dateLivraison', label: 'Date de livraison', placeholder: '', full: false },
                  { key: 'dateEssayage', label: "Date d'essayage", placeholder: '', full: false },
                ].map(f => (
                  <div key={f.key} style={f.full ? { gridColumn: 'span 2' } : {}}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.key.includes('date') ? 'date' : f.key.includes('Prix') || f.key.includes('Avance') ? 'number' : 'text'}
                      value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description du modèle..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: '#FAFAF8', border: '1px solid #e5e0d8', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} style={{ flex: 2, padding: 12, background: '#F97316', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
