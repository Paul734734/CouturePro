import type { ReactNode } from 'react'

interface GroupeBoutonsActionProps {
  children: ReactNode
  className?: string
}

// Groupe de boutons d'action (Annuler/Enregistrer, Modifier/Sauvegarder...).
// Sous 480px, empilés en colonne pleine largeur pour ne jamais déborder de
// l'écran (bouton coupé sur le bord droit) ; au-dessus, alignés en ligne.
// Chaque bouton enfant doit avoir la classe "w-full min-[480px]:w-auto" en
// plus de son style existant.
export default function GroupeBoutonsAction({ children, className = '' }: GroupeBoutonsActionProps) {
  return (
    <div className={`flex flex-col min-[480px]:flex-row gap-2 min-[480px]:gap-3 ${className}`}>
      {children}
    </div>
  )
}
