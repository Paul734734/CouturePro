import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate } from '../../lib/utils'
import { useClientesStore } from '@/store/clientesStore'
import type { Cliente, FormulaireCliente } from '../../types'

export default function Clientes() {
  const { clientes, fetchClientes, ajouterCliente, isLoading, error } = useClientesStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nom: '', telephone: '', ville: '', quartier: '', profession: '', stylePreference: '', budgetHabituel: '', notes: '' })

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const filtered = clientes.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.ville ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!form.nom || !form.telephone) return
    const payload: FormulaireCliente = {
      nom: form.nom,
      telephone: form.telephone,
      ville: form.ville,
      quartier: form.quartier,
      profession: form.profession,
      stylePreference: form.stylePreference,
      budgetHabituel: Number(form.budgetHabituel) || 0,
      notes: form.notes,
    }
    await ajouterCliente(payload)
    setForm({ nom: '', telephone: '', ville: '', quartier: '', profession: '', stylePreference: '', budgetHabituel: '', notes: '' })
    setShowForm(false)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }

  return (
    <AppLayout titre="Clientes">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Rechercher une cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 320 }}
          />
          <button
            onClick={() => setShowForm(true)}
            style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Nouvelle cliente
          </button>
        </div>

        {isLoading && <p>Chargement...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #f0ede8', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.nom}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{c.telephone}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{c.ville}{c.quartier ? ` · ${c.quartier}` : ''}</div>
              {c.stylePreference && <div style={{ color: '#F97316', fontSize: 12, marginTop: 6 }}>{c.stylePreference}</div>}
              <div style={{ color: '#bbb', fontSize: 11, marginTop: 8 }}>Ajoutée le {formatDate(c.dateAjout)}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480 }}>
              <h3 style={{ marginTop: 0 }}>Nouvelle cliente</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input style={inputStyle} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Ville</label>
                  <input style={inputStyle} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
