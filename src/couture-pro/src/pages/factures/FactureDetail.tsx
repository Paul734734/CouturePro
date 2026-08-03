import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useFacturesStore } from '../../store/facturesStore'
import { useAuthStore } from '../../store/authStore'
import { resolveFileUrl } from '@/lib/api'

export default function FactureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { getFactureById, fetchFactures, isLoading } = useFacturesStore()
  const printRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Sans ça, un acces direct/rechargement sur cette page (lien partage,
  // favori, F5) affichait "Facture introuvable" : le store ne contenait la
  // facture que si une AUTRE page (ex: detail de commande) l'avait deja
  // chargee juste avant, dans la meme session client-side.
  useEffect(() => {
    fetchFactures()
  }, [fetchFactures])

  const facture = id ? getFactureById(id) : undefined

  if (!facture && isLoading) {
    return (
      <AppLayout titre="Facture">
        <p style={{ color: '#888', textAlign: 'center', padding: '60px 20px' }}>Chargement...</p>
      </AppLayout>
    )
  }

  if (!facture) {
    return (
      <AppLayout titre="Facture introuvable">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
          <h2>Facture introuvable</h2>
          <button
            onClick={() => navigate('/factures')}
            style={{
              background: '#C9A227', color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px 28px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Retour aux factures
          </button>
        </div>
      </AppLayout>
    )
  }

  const handleImprimer = () => window.print()

  const handleTelecharger = async () => {
    if (!printRef.current) return
    setIsGenerating(true)
    try {
      // Chargées à la demande : ~570 Ko à elles deux, inutile de les charger
      // tant que la personne ne clique pas vraiment sur "Télécharger".
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      // html2canvas capture le DOM tel quel au moment de l'appel : sans ça,
      // le logo (chargé de façon asynchrone depuis /uploads/...) apparaît
      // comme un cadre vide sur le PDF si le navigateur n'a pas fini de le
      // charger avant la capture (constaté en test : logo absent du PDF
      // malgré un <img src=...> correct dans le DOM).
      const images: HTMLImageElement[] = Array.from(printRef.current.querySelectorAll('img'))
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) { resolve(); return }
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
        )
      )

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${facture.numero}.pdf`)
    } catch (err) {
      console.error('Erreur génération PDF', err)
      alert('Erreur lors de la génération du PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePartager = async () => {
    const texte = `${facture.numero}\nCliente: ${facture.clienteNom}\nMontant: ${facture.montantTotal.toLocaleString()} FCFA\nReste: ${facture.montantReste.toLocaleString()} FCFA\nAtelier: ${facture.nomAtelier}`
    if (navigator.share) {
      await navigator.share({ title: facture.numero, text: texte })
    } else {
      await navigator.clipboard.writeText(texte)
      alert('Informations copiées dans le presse-papier !')
    }
  }

  const statutColor = {
    payee: { bg: '#dcfce7', color: '#16a34a', label: 'Payée' },
    partielle: { bg: '#fcf6e0', color: '#C9A227', label: 'Partielle' },
    impayee: { bg: '#fee2e2', color: '#ef4444', label: 'Impayée' },
  }[facture.statut] || { bg: '#f3f4f6', color: '#555', label: facture.statut }

  const typeLabel = { facture: 'FACTURE', recu: 'REÇU', devis: 'DEVIS' }[facture.type] || 'DOCUMENT'

  return (
    <AppLayout titre={`Facture ${facture.numero}`}>
      <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>

        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, marginBottom: 12, padding: 0 }}
          >
            ← Retour
          </button>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleImprimer}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e5e5',
                background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleTelecharger}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: '#FCF6E0', color: '#C9A227', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              ⬇️ Télécharger
            </button>
            <button
              onClick={handlePartager}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: '#C9A227', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              📤 Partager
            </button>
          </div>
        </div>

        <div
          ref={printRef}
          style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16,
            overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          data-print
        >
          <div style={{
            background: 'linear-gradient(135deg, #C9A227, #d9bb5c)',
            padding: '28px 28px 24px', color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {facture.logoAtelier && (
                  <img
                    src={resolveFileUrl(facture.logoAtelier)}
                    alt="Logo atelier"
                    style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', background: '#fff', flexShrink: 0 }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{facture.nomAtelier}</div>
                  <div style={{ opacity: 0.85, fontSize: 13, marginTop: 4 }}>Atelier de couture</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)', borderRadius: 8,
                  padding: '6px 14px', fontSize: 14, fontWeight: 700, display: 'inline-block',
                }}>
                  {typeLabel}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{facture.numero}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px' }}>
            <div className="cp-grid-2" style={{ gap: 20, marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A227', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Facturé à
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 4 }}>{facture.clienteNom}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A227', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Dates
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>
                  Émission : <strong>{new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</strong>
                </div>
                <div style={{ fontSize: 13, color: '#555' }}>
                  Échéance : <strong>{new Date(facture.dateEcheance || facture.dateEmission).toLocaleDateString('fr-FR')}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{
                background: '#FAFAF8', borderRadius: 10, overflow: 'hidden',
                border: '1px solid #f0f0f0',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  padding: '10px 16px', background: '#f5f5f5',
                  fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase',
                }}>
                  <span>Prestation</span>
                  <span style={{ textAlign: 'right', paddingRight: 20 }}>Qté</span>
                  <span style={{ textAlign: 'right' }}>Montant</span>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  padding: '14px 16px', borderTop: '1px solid #f0f0f0',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>{facture.commandeDescription}</div>
                    {facture.notes && <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{facture.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', paddingRight: 20, color: '#555', fontSize: 14 }}>1</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                    {Number(facture.montantTotal).toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ width: 280 }}>
                {[
                  { label: 'Sous-total', val: `${Number(facture.montantTotal).toLocaleString()} FCFA`, bold: false },
                  { label: 'Avance reçue', val: `- ${Number(facture.montantPaye).toLocaleString()} FCFA`, bold: false, color: '#16a34a' },
                ].map((ligne) => (
                  <div key={ligne.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid #f0f0f0',
                  }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{ligne.label}</span>
                    <span style={{ fontSize: 13, color: ligne.color || '#1a1a1a', fontWeight: ligne.bold ? 700 : 400 }}>
                      {ligne.val}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0', borderTop: '2px solid #C9A227', marginTop: 4,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Reste à payer</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: facture.montantReste > 0 ? '#C9A227' : '#16a34a' }}>
                    {Number(facture.montantReste).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <span style={{
                background: statutColor.bg, color: statutColor.color,
                borderRadius: 20, padding: '8px 24px', fontWeight: 700, fontSize: 14,
                border: `1px solid ${statutColor.color}33`,
              }}>
                {statutColor.label === 'Payée' ? '✅' : statutColor.label === 'Partielle' ? '⚠️' : '❌'} {statutColor.label}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid #f0f0f0', paddingTop: 16,
              textAlign: 'center', color: '#aaa', fontSize: 12,
            }}>
              Merci pour votre confiance · {facture.nomAtelier}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root * { visibility: hidden; }
          [data-print] * { visibility: visible; }
        }
      `}</style>
    </AppLayout>
  )
}
