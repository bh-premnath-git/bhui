import React, { useState, useEffect, ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactElement
  title: string
}

export const PortalModal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalElement(document.getElementById('portal-root'))
  }, [])

  if (!isOpen || !portalElement) return null

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    portalElement
  )
}
