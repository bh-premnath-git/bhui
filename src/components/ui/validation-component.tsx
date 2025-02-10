import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

interface ValidationComponentProps {
  onValidate: () => Promise<boolean>;
  error: boolean;
  errorMsg: string;
  onValidationChange?: (state: 'initial' | 'validating' | 'validated' | 'not-validated') => void;
}

export function ValidationComponent({ 
  onValidate, 
  error, 
  errorMsg,
  onValidationChange 
}: ValidationComponentProps) {
  const [validationState, setValidationState] = useState<'initial' | 'validating' | 'validated' | 'not-validated'>('initial')
  const [internalError, setInternalError] = useState(false)

  useEffect(() => {
    setInternalError(error)
  }, [error])

  useEffect(() => {
    onValidationChange?.(validationState)
  }, [validationState, onValidationChange])

  const startValidation = async () => {
    setInternalError(false)
    setValidationState('validating')

    try {
      const result = await onValidate()
      const newState = result ? 'validated' : 'not-validated'
      setValidationState(newState)
      setInternalError(!result)
    } catch (error) {
      setValidationState('not-validated')
      setInternalError(true)
    }
  }

  const getCheckboxColor = () => {
    switch (validationState) {
      case 'initial':
        return 'bg-gray-300 hover:bg-gray-400 transition-colors'
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
        return 'Validation Failed'
    }
  }

  const isButtonDisabled = validationState === 'validating'

  return (
    <div className="flex flex-col gap-4 relative">
      <div 
        className={`flex items-center space-x-2 ${isButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
        onClick={() => !isButtonDisabled && startValidation()}
      >
        <motion.div
          className={`w-6 h-6 rounded flex items-center justify-center ${getCheckboxColor()}`}
          animate={{ 
            scale: validationState === 'validating' ? [1, 1.1, 1] : 1,
            opacity: isButtonDisabled ? 0.7 : 1
          }}
          transition={{ 
            repeat: validationState === 'validating' ? Infinity : 0, 
            duration: 0.5 
          }}
        >
          {validationState === 'validated' && <Check className="text-white" size={16} />}
          {validationState === 'not-validated' && <X className="text-white" size={16} />}
        </motion.div>
        <Label className={`${isButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
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

      <AnimatePresence>
        {(internalError || error) && (
          <motion.div
            className="absolute left-0 right-0 top-full mt-2 w-[250px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-2 px-3">
                <Alert variant="destructive" className="border-0 bg-transparent p-0">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <AlertDescription className="text-xs">
                      {errorMsg}
                    </AlertDescription>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}