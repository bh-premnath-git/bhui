import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatSlidingPortal } from './ChatSlidingPortal'

const SparkleButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative inline-block">
      <motion.button
        className="relative w-18 h-18 rounded-full overflow-hidden group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
          <img src="/assets/buildPipeline/bighammer.png" alt="bighammer" className="w-16 h-16" />
      </motion.button>

      <ChatSlidingPortal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        imageSrc="/assets/buildPipeline/bighammer.png" 
      />

    </div>
  )
}

export default SparkleButton

