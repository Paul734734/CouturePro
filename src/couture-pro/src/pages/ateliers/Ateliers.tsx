import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useAteliersStore, type FormulaireAtelier } from '@/store/ateliersStore'
import { useAcces, FeatureGate } from '@/components/hooks/useAcces'
import ConfirmModal from '@/components/ui/ConfirmModal'

const MAX_ATELIERS = 3

export default function Ateliers() {
  const { peutAcceder } = useAcces()
  const acces = peutAcceder('multiAtelier')
  const { ateliers, fetchAteliers, ajouterAtelier, modifierAtelier, supprimerAtelier, isLoading, error } = useAteliersStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nom: '', ville: '', quartier: '', telephone: '' })
  const [idASupprimer, setIdASupprimer] = useState<string | null>(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)
  const [erreurFormulaire, setErreurFormulaire] = useState('')

  useEffect(() => {
    if (acces) fetchAteliers()
  }, [fetchAteliers, acces])

  if (!acces) {
    return (
      <AppLayout titre="Multi-atelier" sousTitre="Gérez plusieurs espaces ateliers">
        <FeatureGate feature="multiAtelier" />
      </AppLayout>
    )
  }

  const resetForm = () => {
    setForm({ nom: '', ville: '', quartier: '', telephone: '' })
    setEditingId(null)
    setErreurFormulaire('')
  }

  const ouvrirEdition = (id: string) => {
    const a = ateliers.find((x) => x.id === id)
    if (!a) return
    setForm({ nom: a.nom, ville: a.ville || '', quartier: a.quartier || '', telephone: a.telephone || '' })
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.nom.trim()) return
    setErreurFormulaire('')
    const payload: FormulaireAtelier = {
      nom: form.nom,
      ville: form.ville || undefined,
      quartier: form.quartier || undefined,
      telephone: form.telephone || undefined,
    }
    try {
      if (editingId) {
        await modifierAtelier(editingId, payload)
      } else {
        await ajouterAtelier(payload)
      }
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setErreurFormulaire(err.response?.data?.detail || "Impossible d'enregistrer cet atelier.")
    }
  }

  const confirmerSuppression = async () => {
    if (!idASupprimer) return
    setSuppressionEnCours(true)
    try {
      await supprimerAtelier(idASupprimer)
    } finally {
      setSuppressionEnCours(false)
      setIdASupprimer(null)
    }
  }

  return (
    <AppLayout titre="Multi-atelier" sousTitre={`${ateliers.length} / ${MAX_ATELIERS} espaces ateliers utilisés`}>
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
            Le forfait Elite permet de gérer jusqu'à {MAX_ATELIERS} espaces ateliers distincts (adresses, équipes) depuis ce compte.
          </p>
          {ateliers.length < MAX_ATELIERS && (
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              style={{ background: '#C9A227', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 16 }}
            >
              + Ajouter un atelier
            </button>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {isLoading ? (
          <p style={{ color: '#888', fontSize: 14 }}>Chargement...</p>
        ) : ateliers.length === 0 ? (
          <div style={{ background: 'white', border: '1px dashed #e5e0d8', borderRadius: 14, padding: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>
            Aucun atelier secondaire pour l'instant. Ajoutez-en un pour commencer.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ateliers.map((a) => (
              <div key={a.id} style={{ background: 'white', border: '1px solid #f0ede8', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.nom}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {[a.quartier, a.ville].filter(Boolean).join(', ') || 'Adresse non renseignée'}
                    {a.telephone ? ` · ${a.telephone}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => ouvrirEdition(a.id)} style={{ background: '#f5f2eb', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>
                  <button onClick={() => setIdASupprimer(a.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 420, maxWidth: '90vw' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editingId ? "Modifier l'atelier" : 'Nouvel atelier'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="Nom de l'atelier *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={inputStyle} />
                <input placeholder="Ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} style={inputStyle} />
                <input placeholder="Quartier" value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} style={inputStyle} />
                <input placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} style={inputStyle} />
              </div>
              {erreurFormulaire && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>{erreurFormulaire}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={() => { resetForm(); setShowForm(false) }} style={{ background: '#f5f2eb', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} disabled={!form.nom.trim()} style={{ background: '#C9A227', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: form.nom.trim() ? 'pointer' : 'default', opacity: form.nom.trim() ? 1 : 0.5 }}>
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          ouvert={!!idASupprimer}
          titre="Supprimer cet atelier ?"
          message="Cette action est irréversible."
          enCours={suppressionEnCours}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setIdASupprimer(null)}
        />
      </div>
    </AppLayout>
  )
}

const inputStyle: CSSProperties = {
  border: '1px solid #e5e0d8', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none',
}
