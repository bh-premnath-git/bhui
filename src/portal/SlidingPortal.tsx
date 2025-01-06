import React, { ReactElement, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactElement
  title: string
  type?: string
}

export const SlidingPortalModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  type,
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  // Grab the portal root once
  useEffect(() => {
    setPortalElement(document.getElementById('slide-portal-root'))
  }, [])

  // If we can't find a portal element, don't render anything
  if (!portalElement) return null

  return createPortal(
    // AnimatePresence will handle mounting/unmounting animations for us
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          // Framer Motion props for fade-in/fade-out
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose} // Close on backdrop click
        >
          {/* Sliding Panel */}
          <motion.div
            key="sliding-panel"
            className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-lg"
            // Framer Motion props for slide in/out from the right
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center p-6 border-b">
                <div className="flex items-center flex-1">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  {type && (
                    <span className="ml-4 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                      {type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{title}</p>
              </div>
              <div className="flex-grow overflow-y-auto p-6">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement
  )
}
