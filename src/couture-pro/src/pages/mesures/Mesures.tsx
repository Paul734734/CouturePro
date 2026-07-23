import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { genId } from '../../lib/utils'

const mockClientes = [
  { id: '1', nom: 'Aminata Diallo' },
  { id: '2', nom: 'Fatoumata Koné' },
  { id: '3', nom: 'Nadia Mbaye' },
  { id: '4', nom: 'Mariam Touré' },
  { id: '5', nom: 'Aïcha Kouyaté' },
]

const mockMesures: Record<string, any> = {
  '1': { poitrine: 92, taille: 72, hanche: 98, longueurRobe: 130, manches: 58, epaules: 38, bras: 28, sousPoitrine: 78, hauteurPoitrine: 24, ecartPoitrine: 18, longueurJupe: 65, pantalon: 100, notes: 'Préfère les robes évasées' },
  '2': { poitrine: 96, taille: 76, hanche: 102, longueurRobe: 135, manches: 60, epaules: 40, bras: 29, sousPoitrine: 80, hauteurPoitrine: 25, ecartPoitrine: 19, longueurJupe: 68, pantalon: 103, notes: '' },
}

const champsMesures = [
  { key: 'poitrine', label: 'Poitrine', icon: '📏' },
  { key: 'taille', label: 'Taille', icon: '📏' },
  { key: 'hanche', label: 'Hanche', icon: '📏' },
  { key: 'longueurRobe', label: 'Longueur robe', icon: '👗' },
  { key: 'manches', label: 'Manches', icon: '👕' },
  { key: 'epaules', label: 'Épaules', icon: '👤' },
  { key: 'bras', label: 'Bras', icon: '💪' },
  { key: 'sousPoitrine', label: 'Sous-poitrine', icon: '📐' },
  { key: 'hauteurPoitrine', label: 'Hauteur poitrine', icon: '📐' },
  { key: 'ecartPoitrine', label: 'Écart poitrine', icon: '📐' },
  { key: 'longueurJupe', label: 'Longueur jupe', icon: '👘' },
  { key: 'pantalon', label: 'Pantalon', icon: '👖' },
]

export default function Mesures() {
  const [selectedId, setSelectedId] = useState('1')
  const [mesures, setMesures] = useState(mockMesures)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  const selected = mockClientes.find(c => c.id === selectedId)
  const currentMesures = mesures[selectedId]

  const startEdit = () => {
    setForm(currentMesures ? { ...currentMesures } : {})
    setEditing(true)
  }

  const save = () => {
    setMesures(prev => ({ ...prev, [selectedId]: { ...form, updatedAt: new Date().toISOString() } }))
    setEditing(false)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e0d8',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8',
    boxSizing: 'border-box' as const
  }

  return (
    <AppLayout titre="Mesures">
      <div style={{ maxWidth: 1100, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

        {/* LISTE CLIENTES */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede8' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Mes clientes</h3>
          </div>
          {mockClientes.map(c => (
            <div key={c.id} onClick={() => { setSelectedId(c.id); setEditing(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #f0ede8', background: selectedId === c.id ? '#FFF4ED' : 'white', transition: 'background .15s' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: selectedId === c.id ? '#F97316' : '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: selectedId === c.id ? 'white' : '#F97316' }}>
                {c.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: selectedId === c.id ? '#F97316' : '#1a1a1a' }}>{c.nom}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{mesures[c.id] ? '✅ Mesures enregistrées' : '⚠️ Pas de mesures'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MESURES DETAIL */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📏 Mesures — {selected?.nom}</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>Toutes les mesures en centimètres</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} style={{ padding: '9px 18px', background: '#FAFAF8', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
                  <button onClick={save} style={{ padding: '9px 18px', background: '#F97316', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>💾 Sauvegarder</button>
                </>
              ) : (
                <button onClick={startEdit} style={{ padding: '9px 18px', background: '#FFF4ED', color: '#F97316', border: '1px solid #FED7AA', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ✏️ {currentMesures ? 'Modifier' : 'Saisir les mesures'}
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {editing ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  {champsMesures.map(c => (
                    <div key={c.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>{c.icon} {c.label} (cm)</label>
                      <input type="number" value={form[c.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [c.key]: e.target.value }))} placeholder="0" style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>📝 Notes morphologie</label>
                  <textarea value={form.notes || ''} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} placeholder="Ex: Épaules légèrement tombantes, préfère les robes évasées..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                </div>
              </>
            ) : currentMesures ? (
              <>
                {/* SILHOUETTE VISUELLE */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  {/* Colonne gauche - mesures principales */}
                  <div style={{ background: '#FFF4ED', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#F97316' }}>📐 Mensurations principales</div>
                    {[
                      { key: 'poitrine', label: 'Poitrine' },
                      { key: 'taille', label: 'Taille' },
                      { key: 'hanche', label: 'Hanche' },
                    ].map(m => (
                      <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#555' }}>{m.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ height: 6, width: Math.min((currentMesures[m.key] / 120) * 80, 80), background: '#F97316', borderRadius: 3 }} />
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', minWidth: 40, textAlign: 'right' }}>{currentMesures[m.key]} cm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Colonne droite - autres */}
                  <div style={{ background: '#EFF6FF', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#2563eb' }}>📏 Longueurs & détails</div>
                    {[
                      { key: 'longueurRobe', label: 'Longueur robe' },
                      { key: 'longueurJupe', label: 'Longueur jupe' },
                      { key: 'pantalon', label: 'Pantalon' },
                    ].map(m => (
                      <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#555' }}>{m.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{currentMesures[m.key]} cm</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOUTES LES MESURES */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {champsMesures.map(c => (
                    <div key={c.key} style={{ background: '#FAFAF8', borderRadius: 12, padding: '14px', border: '1px solid #f0ede8', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{c.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{currentMesures[c.key] || '—'}</div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>cm</div>
                    </div>
                  ))}
                </div>

                {currentMesures.notes && (
                  <div style={{ marginTop: 16, background: '#FAFAF8', borderRadius: 12, padding: 16, border: '1px solid #f0ede8' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 4 }}>📝 Notes morphologie</div>
                    <div style={{ fontSize: 14, color: '#333' }}>{currentMesures.notes}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📏</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Aucune mesure enregistrée</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Cliquez sur "Saisir les mesures" pour commencer</div>
                <button onClick={startEdit} style={{ background: '#F97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  + Saisir les mesures
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
