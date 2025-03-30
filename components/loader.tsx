'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const Loader = () => {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setProgress(0)
    setHidden(false)

    const timer = setTimeout(() => {
      setProgress(60)
      setProgress(70)
      setProgress(80)

      const completeTimer = setTimeout(() => {
        setProgress(90)
        setProgress(100)

        const hideTimer = setTimeout(() => {
          setHidden(true)
        }, 1000) // Slight delay for smooth hiding

        return () => clearTimeout(hideTimer)
      }, 400) // Simulate loading progress

      return () => clearTimeout(completeTimer)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <motion.div
      initial={{ width: '0%', opacity: 0 }}
      animate={{
        width: hidden ? '100%' : `${progress}%`,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        width: { duration: 0.5, ease: 'easeInOut' }, // Adjusted duration for smoothness
        opacity: { duration: 0.4 },
        boxShadow: { duration: 0.4 },
      }}
      className="fixed top-0 left-0 z-[9999999] h-[13px] bg-blue-900"
    />
  )
}

export default Loader
