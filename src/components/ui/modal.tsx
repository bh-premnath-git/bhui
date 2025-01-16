import { ReactNode } from "react"

interface ModalProps {
    isOpen: boolean
    children: ReactNode
}

export const Modal = ({ isOpen,  children }: ModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl">
                {children}
            </div>
        </div>
    )
}

Modal.Header = ({ children }: { children: ReactNode }) => (
    <div className="flex justify-between items-center p-4 border-b">
        {children}
    </div>
)

Modal.Body = ({ children }: { children: ReactNode }) => (
    <div className="p-4">
        {children}
    </div>
)

Modal.Footer = ({ children }: { children: ReactNode }) => (
    <div className="flex justify-end p-4 border-t">
        {children}
    </div>
)
