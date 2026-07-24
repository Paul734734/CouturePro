import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useStockStore, type FormulaireArticleStock } from '@/store/stockStore'
import ConfirmModal from '@/components/ui/ConfirmModal'

const UNITES = ['unite', 'metre', 'rouleau', 'kg', 'boite']

export default function Stock() {
  const { articles, fetchStock, ajouterArticle, modifierArticle, supprimerArticle, isLoading, error } = useStockStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nom: '', categorie: '', quantite: '', unite: 'unite', seuilAlerte: '', prixUnitaire: '', fournisseur: '', notes: '',
  })
  const [idASupprimer, setIdASupprimer] = useState<string | null>(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const filtered = articles.filter((a) =>
    a.nom.toLowerCase().includes(search.toLowerCase()) ||
    (a.categorie ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ nom: '', categorie: '', quantite: '', unite: 'unite', seuilAlerte: '', prixUnitaire: '', fournisseur: '', notes: '' })
    setEditingId(null)
  }

  const ouvrirEdition = (id: string) => {
    const a = articles.find((x) => x.id === id)
    if (!a) return
    setForm({
      nom: a.nom,
      categorie: a.categorie || '',
      quantite: String(a.quantite),
      unite: a.unite || 'unite',
      seuilAlerte: a.seuilAlerte != null ? String(a.seuilAlerte) : '',
      prixUnitaire: a.prixUnitaire != null ? String(a.prixUnitaire) : '',
      fournisseur: a.fournisseur || '',
      notes: a.notes || '',
    })
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.quantite) return
    const payload: FormulaireArticleStock = {
      nom: form.nom,
      categorie: form.categorie || undefined,
      quantite: Number(form.quantite) || 0,
      unite: form.unite,
      seuilAlerte: form.seuilAlerte ? Number(form.seuilAlerte) : undefined,
      prixUnitaire: form.prixUnitaire ? Number(form.prixUnitaire) : undefined,
      fournisseur: form.fournisseur || undefined,
      notes: form.notes || undefined,
    }
    if (editingId) {
      await modifierArticle(editingId, payload)
    } else {
      await ajouterArticle(payload)
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
      await supprimerArticle(idASupprimer)
      setIdASupprimer(null)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e0d8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }

  return (
    <AppLayout titre="Stock">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Rechercher un article (tissu, fil, bouton...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 320 }}
          />
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Nouvel article
          </button>
        </div>

        {isLoading && <p>Chargement...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!isLoading && filtered.length === 0 && (
          <p style={{ color: '#888' }}>Aucun article en stock pour l'instant. Ajoute tes tissus, fils, boutons et autres fournitures.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((a) => {
            const enAlerte = a.seuilAlerte != null && a.quantite <= a.seuilAlerte
            return (
              <div
                key={a.id}
                onClick={() => ouvrirEdition(a.id)}
                style={{
                  background: '#fff',
                  border: enAlerte ? '1px solid #FCA5A5' : '1px solid #f0ede8',
                  borderRadius: 14,
                  padding: 16,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700 }}>{a.nom}</div>
                  {enAlerte && <span style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>Stock bas</span>}
                </div>
                {a.categorie && <div style={{ color: '#888', fontSize: 13 }}>{a.categorie}</div>}
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8, color: enAlerte ? '#DC2626' : '#1a1a1a' }}>
                  {a.quantite} {a.unite}
                </div>
                {a.prixUnitaire != null && (
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{a.prixUnitaire.toLocaleString()} FCFA / {a.unite}</div>
                )}
                {a.fournisseur && <div style={{ color: '#bbb', fontSize: 11, marginTop: 6 }}>Fournisseur : {a.fournisseur}</div>}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSupprimer(a.id) }}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: '#DC2626', fontSize: 12, cursor: 'pointer', padding: 0 }}
                >
                  Supprimer
                </button>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>{editingId ? "Modifier l'article" : 'Nouvel article de stock'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nom de l'article *</label>
                  <input placeholder="Ex: Tissu wax bleu" style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <input placeholder="Ex: Tissu, Fil, Bouton, Accessoire" style={inputStyle} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Quantité *</label>
                    <input type="number" style={inputStyle} value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Unité</label>
                    <select style={inputStyle} value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })}>
                      {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Seuil d'alerte</label>
                    <input type="number" placeholder="Ex: 5" style={inputStyle} value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Prix unitaire (FCFA)</label>
                    <input type="number" style={inputStyle} value={form.prixUnitaire} onChange={(e) => setForm({ ...form, prixUnitaire: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Fournisseur</label>
                  <input style={inputStyle} value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' as const }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => { setShowForm(false); resetForm() }} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubmit} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          ouvert={idASupprimer !== null}
          titre="Supprimer cet article ?"
          message="Cet article sera définitivement retiré du stock. Cette action est irréversible."
          enCours={suppressionEnCours}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setIdASupprimer(null)}
        />
      </div>
    </AppLayout>
  )
}
