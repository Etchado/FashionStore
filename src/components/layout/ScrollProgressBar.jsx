import { useEffect, useState } from 'react'
import { motion, useSpring } from 'motion/react'

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)
  const spring = useSpring(progress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
      setProgress(isNaN(pct) ? 0 : pct)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      className="fixed top-0 start-0 h-0.5 bg-brand-500 z-[9999] origin-left"
      style={{ scaleX: spring }}
    />
  )
}
