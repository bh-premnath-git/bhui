import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatSlidingPortal } from './ChatSlidingPortal'
import ai from "/assets/ai/ai.svg"

const SparkleButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <motion.button
        className="relative w-18 h-18 rounded-full overflow-hidden group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
          <img src={ai} alt="ai" className="w-10 h-10" />
      </motion.button>

      <ChatSlidingPortal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        imageSrc={ai} 
      />

    </div>
  )
}

export default SparkleButton