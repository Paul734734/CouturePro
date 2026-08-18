import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useClientesStore } from '@/store/clientesStore'
import { useMesuresStore, type FormulaireMesure } from '@/store/mesuresStore'
import { CATEGORIES_MESURES } from '@/types'

export default function Mesures() {
  const { clienteId } = useParams()
  const navigate = useNavigate()
  const { clientes, fetchClientes, isLoading: loadingClientes } = useClientesStore()
  const {
    fetchMesuresCliente,
    ajouterMesure,
    modifierMesure,
    getDerniereMesure,
    isLoading: loadingMesures,
    error,
  } = useMesuresStore()

  const [selectedId, setSelectedId] = useState<string | null>(clienteId || null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  // priorise la cliente passée dans l'URL (ex: depuis sa fiche), sinon sélectionne la première
  useEffect(() => {
    if (clienteId) {
      setSelectedId(clienteId)
    } else if (!selectedId && clientes.length > 0) {
      setSelectedId(clientes[0].id)
    }
  }, [clienteId, clientes, selectedId])

  useEffect(() => {
    if (selectedId) {
      fetchMesuresCliente(selectedId)
    }
  }, [selectedId, fetchMesuresCliente])

  const selected = clientes.find((c) => c.id === selectedId)
  const currentMesures = selectedId ? getDerniereMesure(selectedId) : undefined

  const startEdit = () => {
    setForm(currentMesures ? { ...currentMesures } : {})
    setEditing(true)
  }

  const save = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const payload: any = { clienteId: selectedId }
      for (const cat of CATEGORIES_MESURES) {
        for (const c of cat.champs) {
          const v = form[c.key]
          payload[c.key] = v !== undefined && v !== '' ? Number(v) : undefined
        }
      }
      payload.notesMorphologie = form.notesMorphologie || undefined

      if (currentMesures) {
        await modifierMesure(currentMesures.id, selectedId, payload as Partial<FormulaireMesure>)
      } else {
        await ajouterMesure(payload as FormulaireMesure)
      }
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e0d8',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8',
    boxSizing: 'border-box' as const
  }

  return (
    <AppLayout titre="Mesures">
      <div className="cp-grid-sidebar" style={{ maxWidth: 1100, gap: 20 }}>

        {/* LISTE CLIENTES */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede8' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Mes clientes</h3>
          </div>
          {loadingClientes && <div style={{ padding: 20, fontSize: 13, color: '#888' }}>Chargement...</div>}
          {!loadingClientes && clientes.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: '#888' }}>Aucune cliente pour l'instant.</div>
          )}
          {clientes.map((c) => (
            <div key={c.id} onClick={() => { navigate(`/mesures/${c.id}`); setEditing(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #f0ede8', background: selectedId === c.id ? '#FBF3DC' : 'white', transition: 'background .15s' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: selectedId === c.id ? '#C9A227' : '#FBF3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: selectedId === c.id ? 'white' : '#C9A227' }}>
                {c.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: selectedId === c.id ? '#C9A227' : '#1a1a1a' }}>{c.nom}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MESURES DETAIL */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#888', fontSize: 14 }}>
              Sélectionnez une cliente pour voir ou saisir ses mesures.
            </div>
          ) : (
            <>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📏 Mesures — {selected.nom}</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>Toutes les mesures en centimètres</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => navigate(`/clientes/${selected.id}`)} style={{ padding: '9px 16px', background: '#FAFAF8', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                    ← Fiche cliente
                  </button>
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)} disabled={saving} style={{ padding: '9px 18px', background: '#FAFAF8', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
                      <button onClick={save} disabled={saving} style={{ padding: '9px 18px', background: '#C9A227', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                    </>
                  ) : (
                    <button onClick={startEdit} style={{ padding: '9px 18px', background: '#FBF3DC', color: '#C9A227', border: '1px solid #E8D28C', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ✏️ {currentMesures ? 'Modifier' : 'Saisir les mesures'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: 24 }}>
                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                    ⚠️ {error}
                  </div>
                )}
                {loadingMesures && !editing ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 13 }}>Chargement des mesures...</div>
                ) : editing ? (
                  <>
                    {CATEGORIES_MESURES.map((cat) => (
                      <div key={cat.titre} style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.3px' }}>
                          {cat.titre}
                        </div>
                        <div className="cp-grid-3" style={{ gap: 16 }}>
                          {cat.champs.map((c) => (
                            <div key={c.key as string}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>{c.label} (cm)</label>
                              <input
                                type="number"
                                value={form[c.key] ?? ''}
                                onChange={(e) => setForm((p: any) => ({ ...p, [c.key]: e.target.value }))}
                                placeholder="0"
                                style={inputStyle}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>📝 Notes morphologie</label>
                      <textarea value={form.notesMorphologie ?? ''} onChange={e => setForm((p: any) => ({ ...p, notesMorphologie: e.target.value }))} placeholder="Ex: Épaules légèrement tombantes, préfère les robes évasées..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                    </div>
                  </>
                ) : currentMesures ? (
                  <>
                    {CATEGORIES_MESURES.map((cat) => {
                      const champsRenseignes = cat.champs.filter(
                        (c) => (currentMesures as any)[c.key] !== undefined && (currentMesures as any)[c.key] !== null
                      )
                      if (champsRenseignes.length === 0) return null
                      return (
                        <div key={cat.titre} style={{ marginBottom: 18 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.3px' }}>
                            {cat.titre}
                          </div>
                          <div className="cp-grid-4" style={{ gap: 12 }}>
                            {champsRenseignes.map((c) => (
                              <div key={c.key as string} style={{ background: '#FAFAF8', borderRadius: 12, padding: '14px', border: '1px solid #f0ede8', textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{c.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{(currentMesures as any)[c.key] ?? '—'}</div>
                                <div style={{ fontSize: 10, color: '#aaa' }}>cm</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {currentMesures.notesMorphologie && (
                      <div style={{ marginTop: 16, background: '#FAFAF8', borderRadius: 12, padding: 16, border: '1px solid #f0ede8' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 4 }}>📝 Notes morphologie</div>
                        <div style={{ fontSize: 14, color: '#333' }}>{currentMesures.notesMorphologie}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📏</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Aucune mesure enregistrée</div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Cliquez sur "Saisir les mesures" pour commencer</div>
                    <button onClick={startEdit} style={{ background: '#C9A227', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      + Saisir les mesures
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
