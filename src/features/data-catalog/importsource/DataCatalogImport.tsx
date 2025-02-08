import type React from "react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, Settings, Eye, Check, X } from "lucide-react"

type Step = {
    id: number
    title: string
    icon: React.ReactNode
}

const steps: Step[] = [
    { id: 1, title: "Select File", icon: <FileIcon className="w-4 h-4" /> },
    { id: 2, title: "Setup Import Options", icon: <Settings className="w-4 h-4" /> },
    { id: 3, title: "Preview and Edit", icon: <Eye className="w-4 h-4" /> },
    { id: 4, title: "Confirm", icon: <Check className="w-4 h-4" /> },
]

export default function FileImportPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        navigate(0);
    }

    return (
        <div className="max-w-[600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-sm text-muted-foreground">Import and preview XML, JSON, CSV, or XLSX files</p>
                </div>
                <Button variant="default" size="icon" className="h-5 w-5" onClick={handleBack}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step.icon}
                        </div>
                        <span
                            className={`ml-2 text-sm hidden sm:inline ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {step.title}
                        </span>
                        {index < steps.length - 1 && (
                            <div className={`h-px w-12 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Select File</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Input
                            type="file"
                            accept=".xml,.json,.csv,.xlsx"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <FileIcon className="mr-2 h-4 w-4" />
                            {selectedFile ? selectedFile.name : "Browse... No file selected."}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-8">
                <Button onClick={handleNext} disabled={!selectedFile} className="w-24">
                    Next
                </Button>
            </div>
        </div>
    )
}