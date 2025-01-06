import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ChatHeader } from './ChatHeader'
import { ChatConversation } from './ChatConversation'
import { ChatInput } from './ChatInput'
import { useConversation } from './UseConversation'
import { ConversationEntry } from './types'

interface ChatSlidingPortalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  type?: string
  imageSrc?: string;
}

export const ChatSlidingPortal: React.FC<ChatSlidingPortalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  imageSrc,
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const { conversation, isLoading, handleSend } = useConversation()

  useEffect(() => {
    setPortalElement(document.getElementById('slide-portal-root'))
  }, [])

  if (!portalElement) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            key="sliding-panel"
            className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              <ChatHeader onClose={onClose} title={title} type={type} imageSrc={imageSrc}/>
              <ChatConversation conversation={conversation} isLoading={isLoading} />
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement
  )
}

