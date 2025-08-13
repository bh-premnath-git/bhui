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
  disabled?: boolean;
  onValidationChange?: (state: ValidationState) => void;
}

export function ValidationButton({ 
  onValidate, 
  isValidating,
  isValidated,
  error,
  disabled = false,
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

  const getCheckboxColor = () => {
    if (disabled) return 'bg-muted'
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

  const getTextColor = () => {
    if (disabled) return 'text-muted-foreground'
    switch (validationState) {
      case 'initial':
        return 'text-secondary-foreground'
      case 'validating':
        return 'text-white'
      case 'validated':
        return 'text-white'
      case 'not-validated':
        return 'text-destructive-foreground'
    }
  }

  const getLabelText = () => {
    if (disabled) return 'Fill all fields to validate'
    switch (validationState) {
      case 'initial': return 'Validate'
      case 'validating': return 'Validating...'
      case 'validated': return 'Validated'
      case 'not-validated': return 'Try Again'
    }
  }

  const isButtonDisabled = disabled || validationState === 'validating'

  const handleClick = () => {
    if (!isButtonDisabled) {
      onValidate()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        type="button"
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${getCheckboxColor()}
          ${isButtonDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        `}
        onClick={handleClick}
        animate={{ 
          scale: validationState === 'validating' && !disabled ? [1, 1.02, 1] : 1 
        }}
        transition={{ 
          repeat: validationState === 'validating' && !disabled ? Infinity : 0, 
          duration: 0.5 
        }}
        disabled={isButtonDisabled}
      >
        <motion.div className="flex items-center justify-center w-4 h-4">
          {validationState === 'validating' && !disabled && <Loader2 className="animate-spin" size={16} />}
          {validationState === 'validated' && !disabled && <Check size={16} />}
          {validationState === 'not-validated' && !disabled && <X size={16} />}
          {disabled && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
        </motion.div>

        {/* Animated label text */}
        <Label className={`cursor-pointer ${getTextColor()}`}>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${validationState}-${disabled}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {getLabelText()}
            </motion.span>
          </AnimatePresence>
        </Label>
      </motion.button>

      {/* Animated error message */}
      <AnimatePresence>
        {error && !disabled && (
          <motion.div
            key="error-message"
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
