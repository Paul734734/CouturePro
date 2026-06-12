import { useEffect, useState } from 'react'

const WORDS = ['tout-en-un', 'intelligente', 'digitale', 'africaine']

export function useWordMorph() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length)
        setVisible(true)
      }, 350)
    }, 2800)

    return () => window.clearInterval(interval)
  }, [])

  return { word: WORDS[index], visible }
}

