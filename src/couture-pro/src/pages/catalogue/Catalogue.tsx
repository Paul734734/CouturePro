import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import GroupeBoutonsAction from '../../components/layout/GroupeBoutonsAction'
import { useCatalogueStore, type FormulaireArticleCatalogue } from '@/store/catalogueStore'
import { uploadPhoto, resolveFileUrl } from '@/lib/api'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function Catalogue() {
  const { catalogue, fetchCatalogue, ajouterItem, modifierItem, supprimerItem, isLoading, error } = useCatalogueStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nom: '', categorie: '', description: '', prixIndicatif: '', tempsConceptionEstime: '', imageUrl: '', actif: true,
  })
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [uploadErreur, setUploadErreur] = useState('')
  const [idASupprimer, setIdASupprimer] = useState<string | null>(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  useEffect(() => {
    fetchCatalogue()
  }, [fetchCatalogue])

  const filtered = catalogue.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.categorie ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ nom: '', categorie: '', description: '', prixIndicatif: '', tempsConceptionEstime: '', imageUrl: '', actif: true })
    setEditingId(null)
    setUploadErreur('')
  }

  const ouvrirEdition = (id: string) => {
    const item = catalogue.find((x) => x.id === id)
    if (!item) return
    setForm({
      nom: item.nom,
      categorie: item.categorie || '',
      description: item.description || '',
      prixIndicatif: item.prixIndicatif != null ? String(item.prixIndicatif) : '',
      tempsConceptionEstime: item.tempsConceptionEstime != null ? String(item.tempsConceptionEstime) : '',
      imageUrl: item.imageUrl || '',
      actif: item.actif,
    })
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.nom) return
    const payload: FormulaireArticleCatalogue = {
      nom: form.nom,
      categorie: form.categorie || undefined,
      description: form.description || undefined,
      prixIndicatif: form.prixIndicatif ? Number(form.prixIndicatif) : undefined,
      tempsConceptionEstime: form.tempsConceptionEstime ? Number(form.tempsConceptionEstime) : undefined,
      imageUrl: form.imageUrl || undefined,
      actif: form.actif,
    }
    if (editingId) {
      await modifierItem(editingId, payload)
    } else {
      await ajouterItem(payload)
    }
    resetForm()
    setShowForm(false)
  }

  const handleSupprimer = (id: string) => {
    setIdASupprimer(id)
  }

  const confirmerSuppression = async () => {
    if (!idASupprimer) return
    setSuppressionEnCours(true)
    try {
      await supprimerItem(idASupprimer)
      setIdASupprimer(null)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const handleChoisirPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErreur('')
    setUploadEnCours(true)
    try {
      const url = await uploadPhoto(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err: any) {
      setUploadErreur(err.response?.data?.detail || "Erreur lors de l'envoi de la photo.")
    } finally {
      setUploadEnCours(false)
      e.target.value = ''
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }

  return (
    <AppLayout titre="Catalogue">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Rechercher un modèle (robe, boubou, tailleur...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 320 }}
          />
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            style={{ background: '#C9A227', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Nouveau modèle
          </button>
        </div>

        {isLoading && <p>Chargement...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!isLoading && filtered.length === 0 && (
          <p style={{ color: '#888' }}>Aucun modèle dans le catalogue pour l'instant. Ajoute les habits que tu proposes à tes clientes.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => ouvrirEdition(item.id)}
              style={{ background: '#fff', border: '1px solid #f0ede8', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', opacity: item.actif ? 1 : 0.55 }}
            >
              <div style={{ height: 140, background: item.imageUrl ? `center / cover no-repeat url(${resolveFileUrl(item.imageUrl)})` : '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {!item.imageUrl && '👗'}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 700 }}>{item.nom}</div>
                {item.categorie && <div style={{ color: '#888', fontSize: 12 }}>{item.categorie}</div>}
                {item.prixIndicatif != null && <div style={{ color: '#C9A227', fontWeight: 600, fontSize: 14, marginTop: 6 }}>{item.prixIndicatif.toLocaleString()} FCFA</div>}
                {item.tempsConceptionEstime != null && <div style={{ color: '#bbb', fontSize: 11, marginTop: 4 }}>{item.tempsConceptionEstime} jour(s) de conception</div>}
                {!item.actif && <div style={{ color: '#bbb', fontSize: 11, marginTop: 4 }}>Archivé</div>}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSupprimer(item.id) }}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: '#DC2626', fontSize: 12, cursor: 'pointer', padding: 0 }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div
            className="pb-[calc(16px_+_64px_+_env(safe-area-inset-bottom))] md:pb-0"
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: 'min(90vh, 100%)', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>{editingId ? 'Modifier le modèle' : 'Nouveau modèle'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nom du modèle *</label>
                  <input placeholder="Ex: Robe sirène wax" style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <input placeholder="Ex: Robe, Tailleur, Boubou" style={inputStyle} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' as const }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Prix indicatif (FCFA)</label>
                    <input type="number" style={inputStyle} value={form.prixIndicatif} onChange={(e) => setForm({ ...form, prixIndicatif: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Temps de conception (jours)</label>
                    <input type="number" step="0.5" style={inputStyle} value={form.tempsConceptionEstime} onChange={(e) => setForm({ ...form, tempsConceptionEstime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Photo du modèle</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                      background: form.imageUrl ? `center / cover no-repeat url(${resolveFileUrl(form.imageUrl)})` : '#FAFAF8',
                      border: '1px solid #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {!form.imageUrl && '👗'}
                    </div>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                      borderRadius: 10, border: '1px solid #e5e0d8', background: '#FAFAF8',
                      fontSize: 13, fontWeight: 600, color: '#555', cursor: uploadEnCours ? 'default' : 'pointer',
                    }}>
                      {uploadEnCours ? 'Envoi...' : form.imageUrl ? 'Changer la photo' : '📷 Choisir une photo'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleChoisirPhoto}
                        disabled={uploadEnCours}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {uploadErreur && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{uploadErreur}</p>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                  <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
                  Visible dans le catalogue (décocher pour archiver)
                </label>
              </div>
              <GroupeBoutonsAction className="mt-5">
                <button onClick={() => { setShowForm(false); resetForm() }} className="w-full min-[480px]:w-auto" style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} className="w-full min-[480px]:w-auto" style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#C9A227', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </GroupeBoutonsAction>
            </div>
          </div>
        )}

        <ConfirmModal
          ouvert={idASupprimer !== null}
          titre="Supprimer ce modèle ?"
          message="Ce modèle sera définitivement retiré du catalogue. Cette action est irréversible."
          enCours={suppressionEnCours}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setIdASupprimer(null)}
        />
      </div>
    </AppLayout>
  )
}
