interface ConfirmModalProps {
  ouvert: boolean
  titre: string
  message: string
  labelConfirmer?: string
  labelAnnuler?: string
  danger?: boolean
  enCours?: boolean
  onConfirmer: () => void
  onAnnuler: () => void
}

export default function ConfirmModal({
  ouvert,
  titre,
  message,
  labelConfirmer = 'Supprimer',
  labelAnnuler = 'Annuler',
  danger = true,
  enCours = false,
  onConfirmer,
  onAnnuler,
}: ConfirmModalProps) {
  if (!ouvert) return null

  return (
    <div
      onClick={onAnnuler}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: 24, width: '100%',
          maxWidth: 380, boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 17, color: '#1a1a1a' }}>{titre}</h3>
        <p style={{ margin: 0, marginBottom: 22, fontSize: 14, color: '#666', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onAnnuler}
            disabled={enCours}
            style={{
              flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5e5',
              background: '#fff', color: '#444', fontWeight: 600, fontSize: 14,
              cursor: enCours ? 'default' : 'pointer',
            }}
          >
            {labelAnnuler}
          </button>
          <button
            onClick={onConfirmer}
            disabled={enCours}
            style={{
              flex: 1, padding: 10, borderRadius: 10, border: 'none',
              background: danger ? '#DC2626' : '#F97316', color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: enCours ? 'default' : 'pointer',
              opacity: enCours ? 0.7 : 1,
            }}
          >
            {enCours ? '...' : labelConfirmer}
          </button>
        </div>
      </div>
    </div>
  )
}
