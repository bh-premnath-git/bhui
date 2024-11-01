import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Label } from "@/components/ui/label"

interface ValidationComponentProps {
  onValidate: () => Promise<boolean>
}

export default function ValidationComponent({ onValidate }: ValidationComponentProps) {
  const [validationState, setValidationState] = useState<'initial' | 'validating' | 'validated' | 'not-validated'>('initial')

  const startValidation = async () => {
    setValidationState('validating')
    
    try {
      const result = await onValidate()
      setValidationState(result ? 'validated' : 'not-validated')
    } catch (error) {
      setValidationState('not-validated')
    }
  }

  const getCheckboxColor = () => {
    switch (validationState) {
      case 'initial':
        return 'bg-gray-300'
      case 'validating':
        return 'bg-blue-400'
      case 'validated':
        return 'bg-green-500'
      case 'not-validated':
        return 'bg-red-500'
    }
  }

  const getLabelText = () => {
    switch (validationState) {
      case 'initial':
        return 'Validate'
      case 'validating':
        return 'Validating...'
      case 'validated':
        return 'Validated'
      case 'not-validated':
        return 'Not Validated'
    }
  }

  return (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={startValidation}>
      <motion.div
        className={`w-6 h-6 rounded flex items-center justify-center ${getCheckboxColor()}`}
        animate={{ scale: validationState === 'validating' ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: validationState === 'validating' ? Infinity : 0, duration: 0.5 }}
      >
        {validationState === 'validated' && <Check className="text-white" size={16} />}
        {validationState === 'not-validated' && <X className="text-white" size={16} />}
      </motion.div>
      <Label className="cursor-pointer">
        <motion.span
          key={validationState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          {getLabelText()}
        </motion.span>
      </Label>
    </div>
  )
}