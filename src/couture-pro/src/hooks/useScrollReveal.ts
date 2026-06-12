import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.cp-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cp-visible')
          }
        })
      },
      { threshold: 0.12 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

