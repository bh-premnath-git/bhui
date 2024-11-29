import React, { useState, useEffect, ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactElement
  title: string
}

export const SlidingPortalModal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setPortalElement(document.getElementById('slide-portal-root'))
  }, [])

  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true)
      setIsAnimating(true)
    } else if (!isOpen && isMounted) {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsMounted(false)
      }, 300) // Match this with the transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMounted])

  if (!portalElement || !isMounted) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 transition-all duration-300 ease-in-out z-50",
        isAnimating ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-lg transition-all duration-300 ease-in-out transform",
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">Configure your flow settings and notifications</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    portalElement
  )
}
