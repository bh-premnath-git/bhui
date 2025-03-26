import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatSlidingPortal } from './components/ChatSlidingPortal'
import ai from "/assets/ai/ai.svg"

const NotebookAiButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <motion.button
        className="relative w-12 h-12 rounded-full overflow-hidden group flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <img 
          src={ai} 
          alt="ai" 
          className="w-4 h-6 transform -rotate-[40deg]"
        />
      </motion.button>
      <ChatSlidingPortal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        imageSrc={ai} 
      />
    </div>
  )
}

export default NotebookAiButton