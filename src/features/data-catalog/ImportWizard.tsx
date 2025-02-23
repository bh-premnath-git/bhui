import React from 'react';
import { useImport } from '@/context/datacatalog/ImportContext';
import { DatabaseConnection } from './components/steps/DatabaseConnection';
import { SchemaSelection } from './components/steps/SchemaSelection';
import { PreviewData } from './components/steps/PreviewData';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { X } from 'lucide-react';

function StepIndicator({ currentStep }: { currentStep: number }) {
    const steps = [
        'Database Connection',
        'Schema Selection',
        'Preview and Import',
    ];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div
                            className={`flex items-center ${index + 1 === currentStep
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 === currentStep
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className="ml-2 text-sm font-medium">{step}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="h-0.5 w-24 bg-muted flex-shrink" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export function ImportWizard() {
    const { step } = useImport();
    const { handleNavigation } = useNavigation();

    const goBack = () => {
        handleNavigation(ROUTES.DATA_CATALOG)
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 relative">
                <div className="bg-white rounded-lg shadow-lg p-8 relative">
                    <X
                        className="absolute top-4 right-4 w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={goBack}
                    />
                    <div className="max-w-4xl mx-auto">

                        <div className="mb-12">
                            <StepIndicator currentStep={step} />
                        </div>
                        <div className="grid place-items-center">
                            {step === 1 && <DatabaseConnection />}
                            {step === 2 && <SchemaSelection />}
                            {step === 3 && <PreviewData />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}