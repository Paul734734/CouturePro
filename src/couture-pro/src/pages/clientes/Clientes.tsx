import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate, genId } from '../../lib/utils'
import type { Cliente } from '../../types'

const mockClientes: Cliente[] = [
  { id: '1', nom: 'Aminata Diallo', telephone: '+221 77 123 45 67', ville: 'Dakar', quartier: 'Plateau', profession: 'Enseignante', stylePreféré: 'Africain moderne', budgetHabituel: 35000, createdAt: '2024-01-15' },
  { id: '2', nom: 'Fatoumata Koné', telephone: '+225 07 456 78 90', ville: 'Abidjan', quartier: 'Cocody', profession: 'Comptable', stylePreféré: 'Classique élégant', budgetHabituel: 50000, createdAt: '2024-02-20' },
  { id: '3', nom: 'Nadia Mbaye', telephone: '+221 78 987 65 43', ville: 'Dakar', quartier: 'Almadies', profession: 'Médecin', stylePreféré: 'Soirée', budgetHabituel: 80000, createdAt: '2024-03-10' },
  { id: '4', nom: 'Mariam Touré', telephone: '+224 62 345 67 89', ville: 'Conakry', quartier: 'Kaloum', profession: 'Avocate', stylePreféré: 'Tailleur', budgetHabituel: 60000, createdAt: '2024-04-05' },
  { id: '5', nom: 'Aïcha Kouyaté', telephone: '+223 76 234 56 78', ville: 'Bamako', quartier: 'ACI 2000', profession: 'Directrice', stylePreféré: 'Boubou luxe', budgetHabituel: 75000, createdAt: '2024-05-12' },
]

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nom: '', telephone: '', ville: '', quartier: '', profession: '', stylePreféré: '', budgetHabituel: '', notes: '' })

  const filtered = clientes.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.ville.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = () => {
    if (!form.nom || !form.telephone) return
    const nouvelle: Cliente = {
      id: genId(),
      ...form,
      budgetHabituel: Number(form.budgetHabituel) || 0,
      createdAt: new Date().toISOString()
    }
    setClientes(prev => [nouvelle, ...prev])
    setForm({ nom: '', telephone: '', ville: '', quartier: '', profession: '', stylePreféré: '', budgetHabituel: '', notes: '' })
    setShowForm(false)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Mes Clientes</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{clientes.length} clientes enregistrées</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: '#F97316', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            + Ajouter une cliente
          </button>
        </div>

        {/* SEARCH */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou ville..." style={{ ...inputStyle, paddingLeft: 42, borderRadius: 50 }} />
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', padding: 20, cursor: 'pointer', transition: 'box-shadow .2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#F97316' }}>
                  {c.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.nom}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{c.ville} · {c.quartier}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                  <span>📞</span> {c.telephone}
                </div>
                {c.profession && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                  <span>💼</span> {c.profession}
                </div>}
                {c.budgetHabituel && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                  <span>💰</span> Budget moy. {new Intl.NumberFormat('fr-FR').format(c.budgetHabituel)} FCFA
                </div>}
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#aaa' }}>Depuis {formatDate(c.createdAt)}</span>
                <span style={{ fontSize: 11, background: '#FFF4ED', color: '#F97316', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>{c.stylePreféré}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DETAIL */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#F97316' }}>{selected.nom.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.nom}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{selected.ville} · {selected.quartier}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              {[
                ['📞 Téléphone', selected.telephone],
                ['💼 Profession', selected.profession],
                ['👗 Style préféré', selected.stylePreféré],
                ['💰 Budget habituel', selected.budgetHabituel ? new Intl.NumberFormat('fr-FR').format(selected.budgetHabituel) + ' FCFA' : '—'],
                ['📅 Cliente depuis', formatDate(selected.createdAt)],
              ].map(([label, value]) => value && (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0ede8', fontSize: 14 }}>
                  <span style={{ color: '#888' }}>{label as string}</span>
                  <span style={{ fontWeight: 600 }}>{value as string}</span>
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 20, background: '#F97316', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                📏 Voir les mesures
              </button>
            </div>
          </div>
        )}

        {/* MODAL AJOUT */}
        {showForm && (
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Nouvelle cliente</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'nom', label: 'Nom complet *', placeholder: 'Aminata Diallo' },
                  { key: 'telephone', label: 'Téléphone *', placeholder: '+221 77 000 00 00' },
                  { key: 'ville', label: 'Ville', placeholder: 'Dakar' },
                  { key: 'quartier', label: 'Quartier', placeholder: 'Plateau' },
                  { key: 'profession', label: 'Profession', placeholder: 'Enseignante' },
                  { key: 'stylePreféré', label: 'Style préféré', placeholder: 'Africain moderne' },
                  { key: 'budgetHabituel', label: 'Budget habituel (FCFA)', placeholder: '35000' },
                ].map(f => (
                  <div key={f.key} style={f.key === 'nom' ? { gridColumn: 'span 2' } : {}}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes supplémentaires..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: '#FAFAF8', border: '1px solid #e5e0d8', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} style={{ flex: 2, padding: 12, background: '#F97316', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Enregistrer la cliente</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
