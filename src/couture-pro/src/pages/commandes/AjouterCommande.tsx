import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useCommandesStore } from '../../store/commandesStore'
import { useClientesStore } from '../../store/clientesStore'
import { useAuthStore } from '../../store/authStore'

const TYPES_VETEMENTS = [
  'Robe', 'Tailleur', 'Boubou', 'Ensemble 2 pièces', 'Ensemble 3 pièces',
  'Jupe', 'Pantalon', 'Chemisier', 'Kaftan', 'Aso-ebi', 'Robe de mariée', 'Autre',
]

const STATUTS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'essayage', label: 'Essayage' },
  { value: 'pret', label: 'Prêt' },
  { value: 'livre', label: 'Livré' },
  { value: 'annule', label: 'Annulé' },
]

export default function AjouterCommande() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { ajouterCommande, modifierCommande, getCommandeById } = useCommandesStore()
  const { clientes, fetchClientes } = useClientesStore()

  const isEdit = Boolean(id)
  const existing = isEdit ? getCommandeById(id!) : null
  // clientes vient directement du store, deja filtre par le backend via le token
  const preselectedClienteId = searchParams.get('clienteId') || ''

  const [form, setForm] = useState({
    clienteId: preselectedClienteId,
    typeVetement: '',
    description: '',
    prixTotal: '',
    avancePaye: '',
    dateCommande: new Date().toISOString().split('T')[0],
    dateEssayage: '',
    dateLivraison: '',
    statut: 'en_attente',
    notes: '',
  })
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    if (existing) {
      setForm({
        clienteId: existing.clienteId || '',
        typeVetement: existing.typeVetement || '',
        description: existing.description || '',
        prixTotal: existing.prixTotal?.toString() || '',
        avancePaye: existing.avancePaye?.toString() || '',
        dateCommande: existing.dateCommande || new Date().toISOString().split('T')[0],
        dateEssayage: existing.dateEssayage || '',
        dateLivraison: existing.dateLivraison || '',
        statut: existing.statut || 'en_attente',
        notes: existing.notes || '',
      })
    }
  }, [existing])

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErreurs((e) => ({ ...e, [key]: '' }))
  }

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const valider = () => {
    const e: Record<string, string> = {}
    if (!form.clienteId) e.clienteId = 'Choisissez une cliente'
    if (!form.typeVetement) e.typeVetement = 'Le type de vêtement est requis'
    if (!form.prixTotal || Number(form.prixTotal) <= 0) e.prixTotal = 'Le prix total est requis'
    if (Number(form.avancePaye) > Number(form.prixTotal)) e.avancePaye = "L'avance ne peut dépasser le prix total"
    return e
  }

  const handleSubmit = async () => {
    if (!user) return
    const e = valider()
    if (Object.keys(e).length > 0) { setErreurs(e); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))

    const prixTotal = Number(form.prixTotal)
    const avancePaye = Number(form.avancePaye) || 0
    const resteAPayer = prixTotal - avancePaye
    const clienteNom = clienteSelectionnee?.nom || ''
    const payload = {
      clienteId: form.clienteId,
      typeVetement: form.typeVetement,
      description: form.description,
      prixTotal,
      avancePaye,
      dateCommande: form.dateCommande,
      dateEssayage: form.dateEssayage,
      dateLivraison: form.dateLivraison,
      statut: form.statut,
      notes: form.notes,
      resteAPayer,
    }

    if (isEdit) {
      modifierCommande(id!, payload)
    } else {
      ajouterCommande(payload)
    }

    setLoading(false)
    navigate('/commandes')
  }

  const reste = Number(form.prixTotal || 0) - Number(form.avancePaye || 0)
  const clienteSelectionnee = clientes.find((c) => c.id === form.clienteId)

  return (
    <AppLayout titre={isEdit ? 'Modifier commande' : 'Nouvelle commande'}>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}
          >
            ← Retour
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isEdit ? '✏️ Modifier la commande' : '➕ Nouvelle commande'}
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>
            Remplissez les détails de la commande
          </p>
        </div>

        <Section titre="👤 Cliente">
          <Champ label="Choisir la cliente *" erreur={erreurs.clienteId}>
            <select
              value={form.clienteId}
              onChange={(e) => set('clienteId', e.target.value)}
              style={inputStyle(!!erreurs.clienteId)}
            >
              <option value="">Sélectionner une cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom} — {c.ville}</option>
              ))}
            </select>
          </Champ>
          {clienteSelectionnee && (
            <div style={{
              background: '#FFF7ED', border: '1px solid #fed7aa', borderRadius: 10,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#F97316', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}>
                {clienteSelectionnee.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>{clienteSelectionnee.nom}</div>
                <div style={{ color: '#888', fontSize: 12 }}>{clienteSelectionnee.telephone} · {clienteSelectionnee.ville}</div>
              </div>
            </div>
          )}
        </Section>

        <Section titre="👗 Vêtement">
          <Champ label="Type de vêtement *" erreur={erreurs.typeVetement}>
            <select
              value={form.typeVetement}
              onChange={(e) => set('typeVetement', e.target.value)}
              style={inputStyle(!!erreurs.typeVetement)}
            >
              <option value="">Choisir le type...</option>
              {TYPES_VETEMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Champ>
          <Champ label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Couleur, tissu, détails particuliers, modèle souhaité..."
              rows={3}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Champ>
          <Champ label="Photo du modèle">
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed #e5e5e5', borderRadius: 10, padding: '16px',
                textAlign: 'center', cursor: 'pointer', background: '#FAFAF8',
                transition: 'border-color 0.15s',
              }}
            >
              {photoPreview ? (
                <div>
                  <img
                    src={photoPreview}
                    alt="Modèle"
                    style={{ maxHeight: 200, borderRadius: 8, maxWidth: '100%', objectFit: 'cover' }}
                  />
                  <p style={{ color: '#F97316', fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>
                    Cliquer pour changer
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
                    Cliquez pour ajouter une photo du modèle
                  </p>
                  <p style={{ color: '#ccc', fontSize: 11, margin: '4px 0 0' }}>JPG, PNG — max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </Champ>
        </Section>

        <Section titre="💰 Prix & Paiement">
          <Champ label="Prix total (FCFA) *" erreur={erreurs.prixTotal}>
            <input
              type="number"
              value={form.prixTotal}
              onChange={(e) => set('prixTotal', e.target.value)}
              placeholder="Ex: 50000"
              style={inputStyle(!!erreurs.prixTotal)}
            />
          </Champ>
          <Champ label="Avance payée (FCFA)" erreur={erreurs.avancePaye}>
            <input
              type="number"
              value={form.avancePaye}
              onChange={(e) => set('avancePaye', e.target.value)}
              placeholder="Ex: 25000"
              style={inputStyle(!!erreurs.avancePaye)}
            />
          </Champ>
          {Number(form.prixTotal) > 0 && (
            <div style={{
              background: reste > 0 ? '#FFF7ED' : '#f0fdf4',
              border: `1px solid ${reste > 0 ? '#fed7aa' : '#bbf7d0'}`,
              borderRadius: 10, padding: '12px 16px',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            }}>
              {[
                { label: 'Total', val: `${Number(form.prixTotal).toLocaleString()}`, color: '#1a1a1a' },
                { label: 'Avance', val: `${Number(form.avancePaye || 0).toLocaleString()}`, color: '#16a34a' },
                { label: 'Reste', val: `${reste.toLocaleString()}`, color: reste > 0 ? '#F97316' : '#16a34a' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{s.label} FCFA</div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section titre="📅 Dates">
          <Champ label="Date de commande">
            <input
              type="date"
              value={form.dateCommande}
              onChange={(e) => set('dateCommande', e.target.value)}
              style={inputStyle(false)}
            />
          </Champ>
          <Champ label="Date d'essayage">
            <input
              type="date"
              value={form.dateEssayage}
              onChange={(e) => set('dateEssayage', e.target.value)}
              style={inputStyle(false)}
            />
          </Champ>
          <Champ label="Date de livraison">
            <input
              type="date"
              value={form.dateLivraison}
              onChange={(e) => set('dateLivraison', e.target.value)}
              style={inputStyle(false)}
            />
          </Champ>
        </Section>

        <Section titre="📌 Statut & Notes">
          <Champ label="Statut de la commande">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set('statut', s.value)}
                  type="button"
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    border: form.statut === s.value ? 'none' : '1px solid #e5e5e5',
                    background: form.statut === s.value ? '#F97316' : '#fff',
                    color: form.statut === s.value ? '#fff' : '#555',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Champ>
          <Champ label="Notes internes">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Notes pour vous uniquement..."
              rows={3}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Champ>
        </Section>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #e5e5e5',
              background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: 15,
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2, padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#fbd0b0' : '#F97316', color: '#fff',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15,
            }}
          >
            {loading ? 'Enregistrement...' : isEdit ? '✅ Enregistrer' : '✅ Créer la commande'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
      padding: '20px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {titre}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  )
}

function Champ({ label, erreur, children }: { label: string; erreur?: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {erreur && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{erreur}</p>}
    </div>
  )
}

const inputStyle = (hasError: boolean): CSSProperties => ({
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
  border: `1.5px solid ${hasError ? '#ef4444' : '#e5e5e5'}`,
  outline: 'none', background: '#FAFAF8', boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif', color: '#1a1a1a',
})
