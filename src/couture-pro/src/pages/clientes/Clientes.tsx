import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { formatDate } from '../../lib/utils'
import { useClientesStore } from '@/store/clientesStore'
import type { Cliente, FormulaireCliente } from '../../types'

export default function Clientes() {
  const navigate = useNavigate()
  const { clientes, fetchClientes, ajouterCliente, isLoading, error } = useClientesStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nom: '', telephone: '', ville: '', quartier: '', adresse: '', profession: '', dateAnniversaire: '', tailleVetement: '', hauteur: '', stylePreference: '', budgetHabituel: '', notes: '' })

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
      adresse: form.adresse,
      profession: form.profession,
      dateAnniversaire: form.dateAnniversaire || undefined,
      tailleVetement: form.tailleVetement,
      hauteur: form.hauteur ? Number(form.hauteur) : undefined,
      stylePreference: form.stylePreference,
      budgetHabituel: Number(form.budgetHabituel) || 0,
      notes: form.notes,
    }
    await ajouterCliente(payload)
    setForm({ nom: '', telephone: '', ville: '', quartier: '', adresse: '', profession: '', dateAnniversaire: '', tailleVetement: '', hauteur: '', stylePreference: '', budgetHabituel: '', notes: '' })
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
            style={{ background: '#C9A227', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Nouvelle cliente
          </button>
        </div>

        {isLoading && <p>Chargement...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clientes/${c.id}`)}
              style={{ background: '#fff', border: '1px solid #f0ede8', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'box-shadow .15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.nom}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{c.telephone}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{c.ville}{c.quartier ? ` · ${c.quartier}` : ''}</div>
              {c.stylePreference && <div style={{ color: '#C9A227', fontSize: 12, marginTop: 6 }}>{c.stylePreference}</div>}
              <div style={{ color: '#bbb', fontSize: 11, marginTop: 8 }}>Ajoutée le {formatDate(c.dateAjout)}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
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
                <div>
                  <label style={labelStyle}>Quartier</label>
                  <input style={inputStyle} value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Adresse</label>
                  <input style={inputStyle} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Profession</label>
                  <input style={inputStyle} value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Date d'anniversaire</label>
                    <input type="date" style={inputStyle} value={form.dateAnniversaire} onChange={(e) => setForm({ ...form, dateAnniversaire: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Taille vêtement</label>
                    <input placeholder="S / M / L / XL" style={inputStyle} value={form.tailleVetement} onChange={(e) => setForm({ ...form, tailleVetement: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Hauteur (m)</label>
                    <input type="number" step="0.01" placeholder="1.72" style={inputStyle} value={form.hauteur} onChange={(e) => setForm({ ...form, hauteur: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Style préféré</label>
                    <input style={inputStyle} value={form.stylePreference} onChange={(e) => setForm({ ...form, stylePreference: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Budget habituel</label>
                  <input type="number" style={inputStyle} value={form.budgetHabituel} onChange={(e) => setForm({ ...form, budgetHabituel: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' as const }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#C9A227', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
