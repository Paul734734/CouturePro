import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useClientesStore } from '../../store/clientesStore'
import { useCommandesStore } from '../../store/commandesStore'
import { useMesuresStore } from '../../store/mesuresStore'
import { useFacturesStore } from '../../store/facturesStore'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../lib/utils'

const ONGLETS = ['Infos', 'Mesures', 'Commandes', 'Factures'] as const
type Onglet = typeof ONGLETS[number]

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  en_cours: 'bg-blue-100 text-blue-700',
  essayage: 'bg-purple-100 text-purple-700',
  pret: 'bg-green-100 text-green-700',
  livre: 'bg-gray-100 text-gray-600',
  annule: 'bg-red-100 text-red-600',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  essayage: 'Essayage',
  pret: 'Prêt',
  livre: 'Livré',
  annule: 'Annulé',
}

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [onglet, setOnglet] = useState<Onglet>('Infos')
  const [supprimerConfirm, setSupprimerConfirm] = useState(false)

  const { getClienteById, supprimerCliente } = useClientesStore()
  const { getCommandesByCliente } = useCommandesStore()
  const { getMesuresByCliente } = useMesuresStore()
  const { getFacturesByCliente } = useFacturesStore()

  const cliente = id ? getClienteById(id) : undefined
  const commandes = id ? getCommandesByCliente(id) : []
  const mesures = id ? getMesuresByCliente(id) : undefined
  const factures = id ? getFacturesByCliente(id) : []

  if (!cliente) {
    return (
      <AppLayout titre="Cliente introuvable">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: 8 }}>Cliente introuvable</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>
            Cette cliente n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => navigate('/clientes')}
            style={{
              background: '#F97316',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            ← Retour aux clientes
          </button>
        </div>
      </AppLayout>
    )
  }

  const initiale = cliente.nom.charAt(0).toUpperCase()
  const totalCommandes = commandes.reduce((s, c) => s + (c.prixTotal || 0), 0)
  const totalPaye = commandes.reduce((s, c) => s + (c.avancePaye || 0), 0)
  const totalReste = totalCommandes - totalPaye

  const handleSupprimer = () => {
    supprimerCliente(cliente.id)
    navigate('/clientes')
  }

  return (
    <AppLayout titre={cliente.nom} sousTitre={`Détails de la cliente`} actionLabel="Retour" onAction={() => navigate('/clientes')}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 40px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '28px 28px 20px',
            marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316, #fb923c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initiale}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
                {cliente.nom}
              </h1>
              <p style={{ color: '#888', fontSize: 14, margin: '0 0 10px' }}>
                📍 {cliente.ville}{cliente.quartier ? ` · ${cliente.quartier}` : ''}
                {cliente.profession ? ` · ${cliente.profession}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {cliente.stylePreference && (
                  <span
                    style={{
                      background: '#FFF7ED',
                      color: '#F97316',
                      border: '1px solid #fed7aa',
                      borderRadius: 20,
                      padding: '3px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {cliente.stylePreference}
                  </span>
                )}
                <span
                  style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: 20,
                    padding: '3px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Link
                to={`/clientes/${cliente.id}/modifier`}
                style={{
                  background: '#F97316',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                ✏️ Modifier
              </Link>
              <button
                onClick={() => setSupprimerConfirm(true)}
                style={{
                  background: '#fff',
                  color: '#ef4444',
                  border: '1px solid #fca5a5',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Total commandé', value: `${totalCommandes.toLocaleString()} FCFA`, color: '#1a1a1a' },
              { label: 'Total payé', value: `${totalPaye.toLocaleString()} FCFA`, color: '#16a34a' },
              { label: 'Reste à payer', value: `${totalReste.toLocaleString()} FCFA`, color: totalReste > 0 ? '#F97316' : '#16a34a' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#FAFAF8',
                  borderRadius: 10,
                  padding: '12px 16px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 16,
            background: '#fff',
            borderRadius: 12,
            padding: 6,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            border: '1px solid #f0f0f0',
          }}
        >
          {ONGLETS.map((o) => (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 8,
                border: 'none',
                background: onglet === o ? '#F97316' : 'transparent',
                color: onglet === o ? '#fff' : '#666',
                fontWeight: onglet === o ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {o === 'Infos' && '👤 '}
              {o === 'Mesures' && '📏 '}
              {o === 'Commandes' && '📦 '}
              {o === 'Factures' && '🧾 '}
              {o}
            </button>
          ))}
        </div>

        {onglet === 'Infos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoCard titre="📞 Contact">
              <InfoLigne label="Téléphone" valeur={cliente.telephone || '—'} />
              <InfoLigne label="Ville" valeur={cliente.ville || '—'} />
              <InfoLigne label="Quartier" valeur={cliente.quartier || '—'} />
              <InfoLigne label="Adresse" valeur={cliente.adresse || '—'} />
            </InfoCard>

            <InfoCard titre="👩 Profil">
              <InfoLigne label="Profession" valeur={cliente.profession || '—'} />
              <InfoLigne
                label="Anniversaire"
                valeur={cliente.dateAnniversaire ? formatDate(cliente.dateAnniversaire) : '—'}
              />
              <InfoLigne label="Style préféré" valeur={cliente.stylePreference || '—'} />
              <InfoLigne
                label="Budget habituel"
                valeur={cliente.budgetHabituel ? `${Number(cliente.budgetHabituel).toLocaleString()} FCFA` : '—'}
              />
            </InfoCard>

            {cliente.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <InfoCard titre="📝 Notes">
                  <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{cliente.notes}</p>
                </InfoCard>
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                to={`/commandes/ajouter?clienteId=${cliente.id}`}
                style={{
                  background: '#F97316',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '11px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                + Nouvelle commande
              </Link>
              <Link
                to={`/mesures/${cliente.id}`}
                style={{
                  background: '#fff',
                  color: '#F97316',
                  border: '1px solid #F97316',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '11px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                📏 Voir mesures
              </Link>
              <Link
                to={`/factures?clienteId=${cliente.id}`}
                style={{
                  background: '#fff',
                  color: '#555',
                  border: '1px solid #e5e5e5',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '11px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                🧾 Nouvelle facture
              </Link>
            </div>
          </div>
        )}

        {onglet === 'Mesures' && (
          <div>
            {mesures ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
                    Dernière mise à jour : {formatDate(mesures.dateMiseAJour ?? mesures.dateMesure)}
                  </p>
                  <Link
                    to={`/mesures/${cliente.id}`}
                    style={{
                      background: '#F97316',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 10,
                      padding: '9px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Modifier
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Poitrine', val: mesures.poitrine },
                    { label: 'Taille', val: mesures.taille },
                    { label: 'Hanche', val: mesures.hanche },
                    { label: 'Longueur robe', val: mesures.longueurRobe },
                    { label: 'Manches', val: mesures.manches },
                    { label: 'Épaules', val: mesures.epaules },
                    { label: 'Bras', val: mesures.bras },
                    { label: 'Sous-poitrine', val: mesures.sousPoitrine },
                    { label: 'Hauteur poitrine', val: mesures.hauteurPoitrine },
                    { label: 'Écart poitrine', val: mesures.ecartPoitrine },
                    { label: 'Longueur jupe', val: mesures.longueurJupe },
                    { label: 'Pantalon', val: mesures.pantalon },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 10,
                        padding: '14px 12px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{m.val ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#bbb' }}>cm</div>
                    </div>
                  ))}
                </div>

                {mesures.notesMorphologie && (
                  <InfoCard titre="📝 Notes morphologie">
                    <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{mesures.notesMorphologie}</p>
                  </InfoCard>
                )}
              </div>
            ) : (
              <EmptyState
                icon="📏"
                titre="Aucune mesure enregistrée"
                desc="Les mesures de cette cliente n'ont pas encore été saisies."
                lien={`/mesures/${cliente.id}`}
                label="Saisir les mesures"
              />
            )}
          </div>
        )}

        {onglet === 'Commandes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <Link
                to={`/commandes/ajouter?clienteId=${cliente.id}`}
                style={{
                  background: '#F97316',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                + Nouvelle commande
              </Link>
            </div>

            {commandes.length === 0 ? (
              <EmptyState
                icon="📦"
                titre="Aucune commande"
                desc="Cette cliente n'a pas encore de commande."
                lien={`/commandes/ajouter?clienteId=${cliente.id}`}
                label="Créer une commande"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {commandes.map((cmd) => (
                  <Link key={cmd.id} to={`/commandes/${cmd.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'box-shadow 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 15, marginBottom: 4 }}>
                            {cmd.typeVetement || 'Commande'}
                          </div>
                          <div style={{ color: '#888', fontSize: 13 }}>{cmd.description || 'Aucun détail'}</div>
                        </div>
                        <span
                          style={{
                            borderRadius: 20,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            background: STATUT_COLORS[cmd.statut]?.split(' ')[0] ?? '#f0f0f0',
                            color: STATUT_COLORS[cmd.statut]?.split(' ')[1] ?? '#444',
                          }}
                        >
                          {STATUT_LABELS[cmd.statut] || cmd.statut}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                        <span style={{ fontSize: 13, color: '#555' }}>
                          💰 {Number(cmd.prixTotal).toLocaleString()} FCFA
                        </span>
                        <span style={{ fontSize: 13, color: '#16a34a' }}>
                          ✅ {Number(cmd.avancePaye).toLocaleString()} payé
                        </span>
                        {(cmd.prixTotal - cmd.avancePaye) > 0 && (
                          <span style={{ fontSize: 13, color: '#F97316', fontWeight: 600 }}>
                            ⚠️ {Number(cmd.prixTotal - cmd.avancePaye).toLocaleString()} reste
                          </span>
                        )}
                      </div>
                      {cmd.dateLivraison && (
                        <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                          📅 Livraison : {new Date(cmd.dateLivraison).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet === 'Factures' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <Link
                to={`/factures?clienteId=${cliente.id}`}
                style={{
                  background: '#F97316',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                + Nouvelle facture
              </Link>
            </div>

            {factures.length === 0 ? (
              <EmptyState
                icon="🧾"
                titre="Aucune facture"
                desc="Aucune facture n'a été générée pour cette cliente."
                lien={`/factures?clienteId=${cliente.id}`}
                label="Créer une facture"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {factures.map((fac) => (
                  <Link key={fac.id} to={`/factures/${fac.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14, marginBottom: 2 }}>
                            {fac.numero}
                          </div>
                          <div style={{ color: '#888', fontSize: 13 }}>{fac.commandeLabel || fac.commandeDescription || 'Facture'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 15 }}>
                            {Number(fac.prixTotal).toLocaleString()} FCFA
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 20,
                              padding: '2px 10px',
                              background: fac.statut === 'solde' ? '#dcfce7' : fac.statut === 'partiel' ? '#fff7ed' : '#fef2f2',
                              color: fac.statut === 'solde' ? '#16a34a' : fac.statut === 'partiel' ? '#F97316' : '#ef4444',
                            }}
                          >
                            {fac.statut === 'solde' ? 'Soldé' : fac.statut === 'partiel' ? 'Partielle' : 'Impayée'}
                          </span>
                        </div>
                      </div>
                      {fac.resteAPayer > 0 && (
                        <div style={{ fontSize: 13, color: '#F97316', marginTop: 8, fontWeight: 600 }}>
                          Reste : {Number(fac.resteAPayer).toLocaleString()} FCFA
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#bbb', marginTop: 6 }}>
                        {new Date(fac.dateEmission).toLocaleDateString('fr-FR')} ·{' '}
                        {fac.typeDocument === 'facture' ? 'Facture' : fac.typeDocument === 'recu' ? 'Reçu' : 'Devis'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {supprimerConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 28,
                maxWidth: 400,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Supprimer {cliente.nom} ?
              </h3>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                Cette action est irréversible. Toutes les données de cette cliente seront supprimées.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setSupprimerConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #e5e5e5',
                    background: '#fff',
                    color: '#555',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSupprimer}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function InfoCard({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F97316', marginBottom: 14, margin: '0 0 14px' }}>
        {titre}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function InfoLigne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#999' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>{valeur}</span>
    </div>
  )
}

function EmptyState({
  icon,
  titre,
  desc,
  lien,
  label,
}: {
  icon: string
  titre: string
  desc: string
  lien: string
  label: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>{titre}</h3>
      <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>{desc}</p>
      <Link
        to={lien}
        style={{
          background: '#F97316',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 10,
          padding: '11px 24px',
          fontSize: 13,
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {label}
      </Link>
    </div>
  )
}
