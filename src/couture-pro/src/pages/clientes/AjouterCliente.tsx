import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import GroupeBoutonsAction from '../../components/layout/GroupeBoutonsAction'
import { useClientesStore } from '../../store/clientesStore'
import { useAuthStore } from '../../store/authStore'
import type { Cliente } from '@/types'
import type * as React from 'react'

const TAILLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const FORM_VIDE = {
  nom: '',
  telephone: '',
  ville: '',
  quartier: '',
  dateAnniversaire: '',
  tailleVetement: '',
  hauteur: '',
  notes: '',
}

export default function AjouterCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { ajouterCliente, modifierCliente, getClienteById, fetchClienteById } = useClientesStore()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(FORM_VIDE)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const remplirForm = (c: Cliente) => {
    setForm({
      nom: c.nom || '',
      telephone: c.telephone || '',
      ville: c.ville || '',
      quartier: c.quartier || '',
      dateAnniversaire: c.dateAnniversaire || '',
      tailleVetement: c.tailleVetement || '',
      hauteur: c.hauteur?.toString() || '',
      notes: c.notes || '',
    })
  }

  // en edition : cherche d'abord dans le cache local, sinon va chercher
  // la cliente sur l'API (cas d'une navigation directe vers /clientes/:id/modifier)
  useEffect(() => {
    if (!isEdit || !id) return
    const cached = getClienteById(id)
    if (cached) {
      remplirForm(cached)
    } else {
      fetchClienteById(id).then((c) => { if (c) remplirForm(c) })
    }
  }, [id])

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErreurs((e) => ({ ...e, [key]: '' }))
  }

  const valider = () => {
    const e: Record<string, string> = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis'
    if (!form.telephone.trim()) e.telephone = 'Le téléphone est requis'
    if (!form.ville.trim()) e.ville = 'La ville est requise'
    if (form.hauteur && (Number(form.hauteur) <= 0 || Number(form.hauteur) > 2.5)) {
      e.hauteur = 'Hauteur invalide (en mètres, ex: 1.72)'
    }
    return e
  }

  const handleSubmit = async () => {
    if (!user) return
    const e = valider()
    if (Object.keys(e).length > 0) { setErreurs(e); return }

    setLoading(true)
    setErreurGlobale(null)
    const payload = {
      nom: form.nom,
      telephone: form.telephone,
      ville: form.ville,
      quartier: form.quartier,
      dateAnniversaire: form.dateAnniversaire,
      tailleVetement: form.tailleVetement,
      hauteur: form.hauteur ? Number(form.hauteur) : undefined,
      notes: form.notes,
    }

    try {
      if (isEdit) {
        await modifierCliente(id!, payload)
      } else {
        await ajouterCliente(payload)
      }
      navigate('/clientes')
    } catch (err: any) {
      setErreurGlobale(err.response?.data?.detail || "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout titre={isEdit ? 'Modifier cliente' : 'Nouvelle cliente'}>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 'var(--form-bottom-reserve)' }}>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, marginBottom: 6, padding: 0 }}
          >
            ← Retour
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isEdit ? '✏️ Modifier la cliente' : '➕ Nouvelle cliente'}
          </h1>
          <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>
            {isEdit ? 'Modifiez les informations de la cliente' : 'Enregistrez une nouvelle cliente dans votre carnet'}
          </p>
        </div>

        {erreurGlobale && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444',
            borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {erreurGlobale}
          </div>
        )}

        <Section titre="👤 Identité">
          <div className="cp-grid-2" style={{ gap: 10 }}>
            <Champ label="Nom complet *" erreur={erreurs.nom}>
              <input value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ex: Aminata Diallo" style={inputStyle(!!erreurs.nom)} />
            </Champ>
            <Champ label="Téléphone *" erreur={erreurs.telephone}>
              <input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+221 77 123 45 67" style={inputStyle(!!erreurs.telephone)} />
            </Champ>
          </div>
          <Champ label="Date de naissance">
            <input type="date" value={form.dateAnniversaire} onChange={(e) => set('dateAnniversaire', e.target.value)} style={inputStyle(false)} />
          </Champ>
        </Section>

        <Section titre="📍 Localisation">
          <div className="cp-grid-2" style={{ gap: 10 }}>
            <Champ label="Ville *" erreur={erreurs.ville}>
              <input value={form.ville} onChange={(e) => set('ville', e.target.value)} placeholder="Ex: Douala, Yaoundé, Dakar..." style={inputStyle(!!erreurs.ville)} />
            </Champ>
            <Champ label="Quartier">
              <input value={form.quartier} onChange={(e) => set('quartier', e.target.value)} placeholder="Ex: Akwa, Bastos, Plateau..." style={inputStyle(false)} />
            </Champ>
          </div>
        </Section>

        <Section titre="📏 Gabarit">
          <div className="cp-grid-2" style={{ gap: 10 }}>
            <Champ label="Taille vêtement" erreur={erreurs.tailleVetement}>
              <select value={form.tailleVetement} onChange={(e) => set('tailleVetement', e.target.value)} style={inputStyle(false)}>
                <option value="">Choisir...</option>
                {TAILLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Champ>
            <Champ label="Hauteur (m)" erreur={erreurs.hauteur}>
              <input
                type="number" step="0.01" min="1" max="2.5"
                value={form.hauteur} onChange={(e) => set('hauteur', e.target.value)}
                placeholder="Ex: 1.72" style={inputStyle(!!erreurs.hauteur)}
              />
            </Champ>
          </div>
        </Section>

        <Section titre="📝 Notes">
          <Champ label="Notes personnelles">
            <textarea
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Allergies, préférences tissu, notes morphologie..." rows={4}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Champ>
        </Section>

        <GroupeBoutonsAction className="mt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full min-[480px]:w-auto"
            style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #e5e5e5', background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full min-[480px]:w-auto"
            style={{
              flex: 2, padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#eeddb0' : '#C9A227', color: '#fff',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15,
            }}
          >
            {loading ? 'Enregistrement...' : isEdit ? '✅ Enregistrer les modifications' : '✅ Ajouter la cliente'}
          </button>
        </GroupeBoutonsAction>
      </div>
    </AppLayout>
  )
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '14px 16px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{titre}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function Champ({ label, erreur, children }: { label: string; erreur?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
      {erreur && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{erreur}</p>}
    </div>
  )
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
  border: `1.5px solid ${hasError ? '#ef4444' : '#e5e5e5'}`,
  outline: 'none', background: '#FAFAF8', boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif', color: '#1a1a1a',
})
