import { motion, type MotionProps } from 'framer-motion'
import type { PropsWithChildren } from 'react'

export default function AnimatedSection(
  props: PropsWithChildren<{
    className?: string
    delayMs?: number
    // Type volontairement relâché pour éviter les erreurs JSX namespace
    as?: any
  }>
) {
  const { children, className, delayMs = 0, as = 'section' } = props

  const base: MotionProps = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      delay: delayMs / 1000,
    },
  }

  const Component: any = motion[as] ?? motion.section

  return (
    <Component className={className} {...base}>
      {children}
    </Component>
  )
}

