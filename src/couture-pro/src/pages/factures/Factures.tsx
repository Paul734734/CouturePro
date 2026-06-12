import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '@/store/authStore'
import { useFacturesStore } from '@/store/facturesStore'

// ─── Types ────────────────────────────────────────────────────────────────────
interface LigneFactureForm {
  description: string
  quantite: number
  prixUnitaire: number
}

interface FactureForm {
  clienteNom: string
  clienteTelephone: string
  type: 'facture' | 'devis' | 'recu'
  lignes: LigneFactureForm[]
  avance: number
  notes: string
}

function peutVoirFactures(forfait?: string, statut?: string): boolean {
  if (statut === 'essai') return true
  if (forfait === 'pro' || forfait === 'elite') return true
  return false
}

function genererPdfFacture(facture: any, nomAtelier?: string) {
  const titreType =
    facture.type === 'facture' ? 'FACTURE' :
    facture.type === 'devis' ? 'DEVIS' : 'REÇU'

  const statutLabel =
    facture.statut === 'payee' ? 'Payée' :
    facture.statut === 'partielle' ? 'Partielle' : 'Impayée'

  const lignesHtml = facture.lignes.map((l: any) => `
    <tr>
      <td>${l.description}</td>
      <td style="text-align:center">${l.quantite}</td>
      <td style="text-align:right">${l.prixUnitaire.toLocaleString('fr-FR')} FCFA</td>
      <td style="text-align:right">${(l.quantite * l.prixUnitaire).toLocaleString('fr-FR')} FCFA</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>${facture.numero}</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
        body { padding: 40px; color: #1a1a1a; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .atelier { font-size: 20px; font-weight: 800; }
        .souslabel { font-size: 12px; color: #888; margin-top: 2px; }
        .doctype { font-size: 18px; font-weight: 800; text-align: right; }
        .docmeta { font-size: 12px; color: #555; text-align: right; margin-top: 4px; }
        hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
        .cliente-titre { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        thead tr { background: #F97316; color: white; }
        th, td { padding: 8px 10px; text-align: left; }
        tbody tr:nth-child(even) { background: #FAFAF8; }
        .totaux { margin-top: 16px; width: 260px; margin-left: auto; font-size: 13px; }
        .totaux div { display: flex; justify-content: space-between; padding: 4px 0; }
        .totaux .final { font-weight: 800; font-size: 14px; border-top: 1px solid #ddd; margin-top: 4px; padding-top: 8px; }
        .statut { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 50px; font-size: 11px; font-weight: 700; }
        .notes { margin-top: 24px; font-size: 12px; color: #555; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="atelier">${nomAtelier || 'Mon Atelier'}</div>
          <div class="souslabel">Couture Pro — Gestion atelier</div>
        </div>
        <div>
          <div class="doctype">${titreType}</div>
          <div class="docmeta">N° ${facture.numero}</div>
          <div class="docmeta">Date : ${facture.dateEmission}</div>
        </div>
      </div>
      <hr />
      <div class="cliente-titre">Cliente</div>
      <div>${facture.clienteNom}</div>
      ${facture.clienteTelephone ? `<div>${facture.clienteTelephone}</div>` : ''}

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:center">Qté</th>
            <th style="text-align:right">Prix unit.</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lignesHtml}
        </tbody>
      </table>

      <div class="totaux">
        <div><span>Total</span><span>${facture.montantTotal.toLocaleString('fr-FR')} FCFA</span></div>
        <div><span>Avance reçue</span><span>-${facture.avance.toLocaleString('fr-FR')} FCFA</span></div>
        <div class="final"><span>Reste à payer</span><span>${facture.reste.toLocaleString('fr-FR')} FCFA</span></div>
        <div style="text-align:right; margin-top:8px;">
          <span class="statut" style="background:#FFF4ED;color:#F97316;">${statutLabel}</span>
        </div>
      </div>

      ${facture.notes ? `<div class="notes"><strong>Notes :</strong> ${facture.notes}</div>` : ''}

      <div class="footer">Document généré via Couture Pro</div>
    </body>
    </html>
  `

  const fenetre = window.open('', '_blank')
  if (!fenetre) {
    alert("Veuillez autoriser les fenêtres pop-up pour télécharger la facture en PDF.")
    return
  }
  fenetre.document.write(html)
  fenetre.document.close()
  fenetre.focus()
  setTimeout(() => {
    fenetre.print()
  }, 300)
}

function ModalNouvelleFacture({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (f: FactureForm) => void
}) {
  const [form, setForm] = useState<FactureForm>({
    clienteNom: '',
    clienteTelephone: '',
    type: 'facture',
    lignes: [{ description: '', quantite: 1, prixUnitaire: 0 }],
    avance: 0,
    notes: '',
  })
  const [error, setError] = useState('')

  const total = form.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0)
  const reste = total - form.avance

  const updateLigne = (i: number, key: keyof LigneFactureForm, val: string | number) => {
    setForm((p) => {
      const lignes = [...p.lignes]
      lignes[i] = { ...lignes[i], [key]: val }
      return { ...p, lignes }
    })
  }

  const ajouterLigne = () => setForm((p) => ({ ...p, lignes: [...p.lignes, { description: '', quantite: 1, prixUnitaire: 0 }] }))
  const supprimerLigne = (i: number) => setForm((p) => ({ ...p, lignes: p.lignes.filter((_, idx) => idx !== i) }))

  const handleSave = () => {
    if (!form.clienteNom.trim()) {
      setError('Le nom de la cliente est obligatoire.')
      return
    }
    if (form.lignes.some((l) => !l.description.trim())) {
      setError('Remplissez toutes les descriptions des prestations.')
      return
    }
    if (total <= 0) {
      setError('Le montant total doit être supérieur à 0.')
      return
    }

    onSave(form)
    onClose()
  }

  const inp = { // eslint-disable-line @typescript-eslint/no-explicit-any

    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    background: '#FAFAFA',
  }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Nouvelle facture</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>Remplissez les informations ci-dessous</p>
          </div>
          <button onClick={onClose} style={{ background: '#F4F4F4', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Type de document</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['facture', 'devis', 'recu'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    border: form.type === t ? '2px solid #F97316' : '1.5px solid #E5E7EB',
                    background: form.type === t ? '#FFF4ED' : 'white',
                    color: form.type === t ? '#F97316' : '#555',
                  }}
                >
                  {t === 'facture' ? '🧾 Facture' : t === 'devis' ? '📄 Devis' : '✅ Reçu'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Nom de la cliente *</label>
              <input
                style={inp}
                placeholder="Ex : Aminata Diallo"
                value={form.clienteNom}
                onChange={(e) => setForm((p) => ({ ...p, clienteNom: e.target.value }))}
              />
            </div>
            <div>
              <label style={lbl}>Téléphone</label>
              <input
                style={inp}
                placeholder="+225 07 00 00 00"
                value={form.clienteTelephone}
                onChange={(e) => setForm((p) => ({ ...p, clienteTelephone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Prestations</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.lignes.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 32px', gap: 6, alignItems: 'center' }}>
                  <input
                    style={inp}
                    placeholder="Description (ex: Robe ankara)"
                    value={l.description}
                    onChange={(e) => updateLigne(i, 'description', e.target.value)}
                  />
                  <input
                    style={{ ...inp, textAlign: 'center' }}
                    type="number"
                    min={1}
                    placeholder="Qté"
                    value={l.quantite}
                    onChange={(e) => updateLigne(i, 'quantite', Number(e.target.value))}
                  />
                  <input
                    style={{ ...inp, textAlign: 'right' }}
                    type="number"
                    placeholder="Prix FCFA"
                    value={l.prixUnitaire || ''}
                    onChange={(e) => updateLigne(i, 'prixUnitaire', Number(e.target.value))}
                  />
                  <button
                    onClick={() => supprimerLigne(i)}
                    disabled={form.lignes.length === 1}
                    style={{ background: 'none', border: 'none', cursor: form.lignes.length === 1 ? 'default' : 'pointer', color: '#ef4444', fontSize: 16, opacity: form.lignes.length === 1 ? 0.3 : 1 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={ajouterLigne}
              style={{ marginTop: 8, background: 'none', border: '1.5px dashed #E5E7EB', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#888', cursor: 'pointer', width: '100%' }}
            >
              + Ajouter une prestation
            </button>
          </div>

          <div>
            <label style={lbl}>Avance déjà reçue (FCFA)</label>
            <input style={inp} type="number" placeholder="0" value={form.avance || ''} onChange={(e) => setForm((p) => ({ ...p, avance: Number(e.target.value) }))} />
          </div>

          <div>
            <label style={lbl}>Notes (optionnel)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Délai de livraison, conditions particulières..."
              style={{ ...inp, height: 64, resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '14px 16px', border: '1px solid #f0ede8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}>
              <span>Total</span>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}>
              <span>Avance reçue</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>−{form.avance.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ height: 1, background: '#e5e0d8', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
              <span>Reste à payer</span>
              <span style={{ color: reste > 0 ? '#ef4444' : '#16a34a' }}>{reste.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #e5e0d8', background: 'white', color: '#555', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
              Annuler
            </button>
            <button onClick={handleSave} style={{ flex: 2, padding: '12px', borderRadius: 50, border: 'none', background: '#F97316', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Créer la facture →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CarteFacture({ facture, nomAtelier }: { facture: any; nomAtelier?: string }) {

  const statutConfig: Record<string, { label: string; bg: string; color: string }> = {
    payee: { label: 'Payée', bg: '#F0FDF4', color: '#16a34a' },
    impayee: { label: 'Impayée', bg: '#FEF2F2', color: '#dc2626' },
    partielle: { label: 'Partielle', bg: '#FFF4ED', color: '#F97316' },
  }
  const s = statutConfig[facture.statut] ?? statutConfig.impayee

  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧾</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{facture.numero}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{facture.clienteNom} · {facture.dateEmission}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{facture.montantTotal.toLocaleString('fr-FR')} FCFA</div>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        <button
          onClick={() => genererPdfFacture(facture, nomAtelier)}
          title="Télécharger en PDF"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF4ED', border: '1px solid #FED7AA', color: '#F97316', padding: '8px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          ⬇️ PDF
        </button>
      </div>
    </div>
  )
}

function FacturesGate() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '60px 32px', textAlign: 'center', minHeight: 400 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FFF4ED', border: '2px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24 }}>🔒</div>
      <div style={{ display: 'inline-block', background: '#FFF4ED', color: '#F97316', padding: '4px 14px', borderRadius: 50, fontSize: 11, fontWeight: 700, marginBottom: 14, border: '1px solid #FED7AA' }}>FORFAIT PRO REQUIS</div>
      <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>Factures & Reçus PDF</h3>
      <p style={{ fontSize: 15, color: '#666', maxWidth: 380, margin: '0 0 28px', lineHeight: 1.6 }}>
        Générez des factures professionnelles avec votre logo et partagez-les par WhatsApp. Disponible à partir du forfait Pro.
      </p>
      <Link to="/profil" style={{ background: '#F97316', color: 'white', padding: '13px 28px', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
        Passer au forfait Pro →
      </Link>
    </div>
  )
}

function BanniereEssai({ joursRestants }: { joursRestants: number }) {
  return (
    <div
      style={{
        background: '#FFF4ED',
        border: '1px solid #FED7AA',
        borderRadius: 12,
        padding: '12px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: 10,
      }}
    >
      <span style={{ fontSize: 13, color: '#C2410C', fontWeight: 600 }}>
        🎁 Essai gratuit — {joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''} · Toutes les fonctionnalités débloquées
      </span>
      <Link
        to="/profil"
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 50,
          background: '#F97316',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        Choisir un forfait
      </Link>
    </div>
  )
}

export default function Factures() {
  const { user } = useAuthStore()
  const accesOk = peutVoirFactures(user?.forfait, user?.statut)
  const estEssai = user?.statut === 'essai'

  const { getFacturesByUser, ajouterFacture } = useFacturesStore()

  const factures = useMemo(() => (user ? getFacturesByUser(user.id) : []), [user, getFacturesByUser])

  const [showModal, setShowModal] = useState(false)
  const [filtreActif, setFiltreActif] = useState('Toutes')

  const facturesFiltrees = factures.filter((f) => {
    if (filtreActif === 'Toutes') return true
    if (filtreActif === 'Payées') return f.statut === 'payee'
    if (filtreActif === 'Impayées') return f.statut === 'impayee'
    if (filtreActif === 'Devis') return f.type === 'devis'
    return true
  })

  const handleSave = (form: FactureForm) => {
    if (!user) return

    const total = form.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0)
    const reste = total - form.avance

    const statut: 'payee' | 'partielle' | 'impayee' = reste === 0 ? 'payee' : form.avance > 0 ? 'partielle' : 'impayee'

    // Conversion UI -> store.
    // Comme le formulaire ne contient pas de commandeId/clienteId,
    // on utilise des valeurs vides (pour l’instant) ; la portée multi-utilisatrice
    // est assurée par `userId` (stockage & filtrage).
    ajouterFacture({
      userId: user.id,
      id: '',
      numero: '',
      commandeId: '',
      clienteId: '',
      commandeDescription: '',
      clienteNom: form.clienteNom.trim(),
      clienteTelephone: form.clienteTelephone.trim(),
      type: form.type,
      statut,
      montantTotal: total,
      avance: form.avance,
      reste,
      dateEmission: new Date().toLocaleDateString('fr-FR'),
      dateEcheance: new Date().toLocaleDateString('fr-FR'),
      logoAtelier: undefined,
      nomAtelier: user.nomAtelier ?? 'Mon Atelier',
      notes: form.notes.trim(),
      lignes: form.lignes,
    } as any)

    setFiltreActif('Toutes')
  }

  return (
    <AppLayout titre="Factures & Reçus" sousTitre="Gérez et générez vos documents professionnels">
      <div style={{ maxWidth: 1400 }}>
        {estEssai && <BanniereEssai joursRestants={user?.joursRestants ?? 7} />}

        {!accesOk ? (
          <FacturesGate />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Toutes', 'Payées', 'Impayées', 'Devis'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFiltreActif(tab)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 50,
                      cursor: 'pointer',
                      border: filtreActif === tab ? 'none' : '1.5px solid #e5e0d8',
                      background: filtreActif === tab ? '#F97316' : 'white',
                      color: filtreActif === tab ? 'white' : '#555',
                      fontSize: 13,
                      fontWeight: filtreActif === tab ? 700 : 400,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{ background: '#F97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                + Nouvelle facture
              </button>
            </div>

            {facturesFiltrees.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 20, border: '1px solid #f0ede8', padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{factures.length === 0 ? "Aucune facture pour l'instant" : 'Aucune facture pour ce filtre'}</h3>
                <p style={{ fontSize: 14, color: '#888', maxWidth: 320, margin: '0 0 24px', lineHeight: 1.6 }}>
                  {factures.length === 0 ? "Créez votre première facture professionnelle et partagez-la avec vos clientes via WhatsApp." : 'Essayez un autre filtre ou créez une nouvelle facture.'}
                </p>
                <button onClick={() => setShowModal(true)} style={{ background: '#F97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {factures.length === 0 ? 'Créer ma première facture' : 'Nouvelle facture'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {facturesFiltrees.map((f) => (
                  <CarteFacture key={f.id} facture={f} nomAtelier={user?.nomAtelier} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && <ModalNouvelleFacture onClose={() => setShowModal(false)} onSave={handleSave} />}
    </AppLayout>
  )
}

