import { useState } from 'react'
import { motion } from 'framer-motion'
import ai from "/assets/ai/ai.svg"
import { PipeLineChatSlidingPortal } from './components/PipeLineChatSlidingPortal'

export const PipeLineAIButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false)

    return (
      <div className="relative inline-block">
        <motion.button
          className="relative w-18 h-18 rounded-full overflow-hidden group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
            <img src={ai} alt="ai" className="w-8 h-8" />
        </motion.button>
        <PipeLineChatSlidingPortal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          imageSrc={ai} 
        />
      </div>
    )
}