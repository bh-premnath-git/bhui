import React from 'react'
import { motion } from 'framer-motion'
import aiIcon from '/assets/ai/ai.svg'
import { useSidebar } from '@/context/SidebarContext'
import { GenericChatUI } from '@/components/shared/GenericChatUI'
import { XplorerGenericChatUI } from './XplorerGenericChat'
import { DataOpsProvider } from '@/context/dataops/DataOpsContext'

interface AIChatButtonProps {
  variant: 'governance' | 'explorer' | 'dataops'
  color?: string
}
/**
 * Renders an animated AI chat toggle button that opens/closes the right panel.
 * Place this component anywhere (e.g., page headers) to trigger the AI chat panel.
 */
export function AIChatButton({ variant, color = '#009f59' }: AIChatButtonProps) {
  const {
    setRightAsideContent,
    closeRightAside,
    isRightAsideOpen,
    rightAsideContent,
  } = useSidebar()

  const CHAT_UI_KEY = `${variant}-chat-ui`
  const isOpen = isRightAsideOpen && (rightAsideContent as React.ReactElement)?.key === CHAT_UI_KEY

  const toggleChat = () => {
    if (isOpen) {
      closeRightAside()
      return
    }

    // animate sidebar open
    document.body.classList.add('right-aside-opening')
    document.body.classList.add('right-aside-opening')
    
    const chatComponent = variant === 'explorer' 
      ? <XplorerGenericChatUI key={CHAT_UI_KEY} imageSrc={aiIcon} variant={variant} />
      : <DataOpsProvider><GenericChatUI key={CHAT_UI_KEY} imageSrc={aiIcon} variant={variant} /></DataOpsProvider>
    
    const title = variant === 'explorer' 
      ? 'Agent Xplorer' 
      : 'Agent DataOps'

    setRightAsideContent(
      chatComponent, 
      title, 
      'w-full'
    )

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      document.body.classList.remove('right-aside-opening')
    }, 50)
  }

  return (
    <motion.div
      className="inline-flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
        className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.05, opacity: 0.9 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.img
          src={aiIcon}
          alt="AI"
          className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
          initial={{ rotate: -45 }}
          animate={{ rotate: -40 }}
          transition={{ type: 'spring', stiffness: 150 }}
        />
      </motion.button>
    </motion.div>
  )
} 