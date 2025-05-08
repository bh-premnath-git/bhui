import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { PlusCircle, Check, X, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  maxSize?: number
}

export function FileUpload({ onFileUpload, maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((selectedFile: File) => {
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit.`)
      return
    }

    setFile(selectedFile)
    setUploadProgress(0)
    setIsUploading(true)
    setError(null)
  }, [maxSize])

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      setError('Invalid file type. Please upload a .json, .pem, .txt, or image file.')
      return
    }
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0])
    }
  }, [handleFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    maxSize: maxSize,
    accept: {
      'application/json': ['.json'],
      'application/x-pem-file': ['.pem'],
      'text/plain': ['.txt'],
      'image/*': []
    }
  })

  useEffect(() => {
    if (file && isUploading) {
      onFileUpload(file)

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
        }
      }, 200)

      return () => clearInterval(interval)
    }
  }, [file, isUploading, onFileUpload])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setError(null)
  }, [])

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center w-full cursor-pointer transition-colors duration-300 ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="group">
          <PlusCircle
            className="mx-auto p-2 rounded-full transition-colors duration-300 h-8 w-8 text-muted-foreground flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here"
            : (
              <>
                Drag & Drop your file or{" "}
                <span
                  className="upload-text text-primary cursor-pointer transition-all duration-300 ease-in-out hover:text-primary-foreground"
                >
                  Upload
                </span>
              </>
            )
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {file && (
        <div className="bg-gray-100 p-2 w-1/2 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{file.name}</span>
            <button
              onClick={handleRemoveFile}
              className="text-destructive hover:text-destructive/80"
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          </div>
          <div className="w-full bg-blue-500 rounded-full h-2.5 mb-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          {uploadProgress === 100 && (
            <div className="flex items-center text-sm text-primary mt-2">
              <Check size={16} className="mr-1" /> Upload complete
            </div>
          )}
        </div>
      )}
    </div>
  )
}