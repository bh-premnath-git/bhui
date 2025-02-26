import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { Label } from "@/components/ui/label"

export type ValidationState = 'initial' | 'validating' | 'validated' | 'not-validated'

interface ValidationButtonProps {
  onValidate: () => Promise<void>;
  isValidating: boolean;
  isValidated: boolean;
  error?: string | null;
  onValidationChange?: (state: ValidationState) => void;
}

export function ValidationButton({ 
  onValidate, 
  isValidating,
  isValidated,
  error,
  onValidationChange 
}: ValidationButtonProps) {
  const [validationState, setValidationState] = useState<ValidationState>('initial')

  // Update validation state based on props
  useEffect(() => {
    let newState: ValidationState = 'initial'
    if (isValidating) newState = 'validating'
    else if (isValidated) newState = 'validated'
    else if (error) newState = 'not-validated'
    setValidationState(newState)
    onValidationChange?.(newState)
  }, [isValidating, isValidated, error, onValidationChange])

  // Set the background color based on the state
  const getCheckboxColor = () => {
    switch (validationState) {
      case 'initial':
        return 'bg-secondary hover:bg-secondary/80'
      case 'validating':
        return 'bg-blue-500'
      case 'validated':
        return 'bg-green-500'
      case 'not-validated':
        return 'bg-destructive'
    }
  }

  // Set the text color based on the state
  const getTextColor = () => {
    switch (validationState) {
      case 'initial':
        return 'text-secondary-foreground' // Dark text for light background
      case 'validating':
        return 'text-white' // White text for dark blue
      case 'validated':
        return 'text-white' // White text for dark green
      case 'not-validated':
        return 'text-destructive-foreground' // Contrasting text for red
    }
  }

  // Set the button label text
  const getLabelText = () => {
    switch (validationState) {
      case 'initial': return 'Validate'
      case 'validating': return 'Validating...'
      case 'validated': return 'Validated'
      case 'not-validated': return 'Try Again'
    }
  }

  const isButtonDisabled = validationState === 'validating'

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        type="button"
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          ${getCheckboxColor()}
          ${isButtonDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        `}
        onClick={() => !isButtonDisabled && onValidate()}
        animate={{ scale: validationState === 'validating' ? [1, 1.02, 1] : 1 }}
        transition={{ repeat: validationState === 'validating' ? Infinity : 0, duration: 0.5 }}
        disabled={isButtonDisabled}
      >
        <motion.div className="flex items-center justify-center w-4 h-4">
          {validationState === 'validating' && <Loader2 className="animate-spin" size={16} />}
          {validationState === 'validated' && <Check size={16} />}
          {validationState === 'not-validated' && <X size={16} />}
        </motion.div>
        <Label className={`cursor-pointer ${getTextColor()}`}>
          <motion.span
            key={validationState}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            {getLabelText()}
          </motion.span>
        </Label>
      </motion.button>

      {error && (
        <motion.div
          className="text-xs text-destructive"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}