import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function FuturisticLoader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center justify-center"
        >
          <motion.img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-uMgNxvZ4pQcyznEljOjey9KCvepxc0.svg"
            alt="Animated hammering logo"
            width={200}
            height={200}
            className="w-40 h-40"
            style={{ originY: 1, originX: 0.5 }}
            initial={{ rotate: -20, y: 0 }}
            animate={{
              rotate: [null, 20, -20],
              y: [null, -20, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "loop",
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500 filter blur-xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.5, scale: 1.2 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>
      {loading && (
        <motion.div
          className="absolute bottom-10 left-0 right-0 text-center text-blue-500 text-2xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Loading...
        </motion.div>
      )}
    </div>
  )
}