import { useState, useEffect } from 'react';
import { 
  PredefinedRecognizer, 
  CustomRecognizer, 
  TestResult, 
  PIIMatch,
  RecognizerTemplate 
} from '@/types/admin/pii';

// Mock data for predefined recognizers
const mockPredefinedRecognizers: PredefinedRecognizer[] = [
  {
    id: 'email',
    name: 'Email Address',
    description: 'Detects email addresses in various formats',
    entityType: 'EMAIL',
    patterns: [
      '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
    ],
    enabled: true,
    builtIn: true,
    category: 'personal'
  },
  {
    id: 'phone',
    name: 'Phone Number',
    description: 'Detects US phone numbers in various formats',
    entityType: 'PHONE',
    patterns: [
      '\\(?\\d{3}\\)?[-.\s]?\\d{3}[-.\s]?\\d{4}',
      '\\+?1?[-.\s]?\\(?\\d{3}\\)?[-.\s]?\\d{3}[-.\s]?\\d{4}'
    ],
    enabled: true,
    builtIn: true,
    category: 'personal'
  },
  {
    id: 'ssn',
    name: 'Social Security Number',
    description: 'Detects US Social Security Numbers',
    entityType: 'SSN',
    patterns: [
      '\\d{3}-\\d{2}-\\d{4}',
      '\\d{3}\\s\\d{2}\\s\\d{4}',
      '\\d{9}'
    ],
    enabled: true,
    builtIn: true,
    category: 'government'
  },
  {
    id: 'credit-card',
    name: 'Credit Card Number',
    description: 'Detects credit card numbers',
    entityType: 'CREDIT_CARD',
    patterns: [
      '\\d{4}[-\s]?\\d{4}[-\s]?\\d{4}[-\s]?\\d{4}',
      '\\d{15,16}'
    ],
    enabled: false,
    builtIn: true,
    category: 'financial'
  },
  {
    id: 'address',
    name: 'Address',
    description: 'Detects postal addresses',
    entityType: 'ADDRESS',
    patterns: [
      '\\d+\\s+[A-Za-z0-9\\.\\s]+,\\s*[A-Za-z\\s]+,\\s*[A-Z]{2}\\s+\\d{5}',
      '\\d+\\s+[A-Za-z0-9\\.\\s]+\\s+(Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)'
    ],
    enabled: false,
    builtIn: true,
    category: 'personal'
  },
  {
    id: 'driver-license',
    name: 'Driver License',
    description: 'Detects driver license numbers',
    entityType: 'DRIVER_LICENSE',
    patterns: [
      '[A-Z]{1,2}\\d{6,8}',
      '[A-Z]\\d{7,8}',
      '\\d{8,9}'
    ],
    enabled: false,
    builtIn: true,
    category: 'government'
  }
];

// Mock data for custom recognizers
const mockCustomRecognizers: CustomRecognizer[] = [
  {
    id: 'employee-id-custom',
    name: 'Employee ID',
    description: 'Company-specific employee identification',
    entityType: 'EMPLOYEE_ID',
    patterns: [
      {
        id: '1',
        name: 'Standard Format',
        pattern: '^EMP[0-9]{4}$',
        description: 'EMP followed by 4 digits'
      },
      {
        id: '2',
        name: 'Extended Format',
        pattern: '^E[0-9]{6}$',
        description: 'E followed by 6 digits'
      }
    ],
    contextWords: ['employee', 'staff', 'worker', 'emp'],
    confidenceScore: 0.85,
    enabled: true,
    builtIn: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'project-code-custom',
    name: 'Project Code',
    description: 'Internal project identification codes',
    entityType: 'PROJECT_CODE',
    patterns: [
      {
        id: '1',
        name: 'Standard Format',
        pattern: '^PRJ-[A-Z]{3}-[0-9]{4}$',
        description: 'PRJ-ABC-1234 format'
      }
    ],
    contextWords: ['project', 'code', 'prj', 'initiative'],
    confidenceScore: 0.9,
    enabled: true,
    builtIn: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  }
];

export function usePII() {
  const [predefinedRecognizers, setPredefinedRecognizers] = useState<PredefinedRecognizer[]>([]);
  const [customRecognizers, setCustomRecognizers] = useState<CustomRecognizer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with mock data
  useEffect(() => {
    setPredefinedRecognizers(mockPredefinedRecognizers);
    setCustomRecognizers(mockCustomRecognizers);
  }, []);

  const toggleRecognizer = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPredefinedRecognizers(prev => 
        prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
      );
      
      setCustomRecognizers(prev => 
        prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
      );
    } catch (err) {
      setError('Failed to toggle recognizer');
    } finally {
      setIsLoading(false);
    }
  };

  const createRecognizer = async (recognizerData: Partial<CustomRecognizer>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecognizer: CustomRecognizer = {
        id: Date.now().toString(),
        name: recognizerData.name!,
        description: recognizerData.description,
        entityType: recognizerData.entityType!,
        patterns: recognizerData.patterns || [],
        contextWords: recognizerData.contextWords || [],
        confidenceScore: recognizerData.confidenceScore || 0.8,
        enabled: true,
        builtIn: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCustomRecognizers(prev => [...prev, newRecognizer]);
    } catch (err) {
      setError('Failed to create recognizer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecognizer = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomRecognizers(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete recognizer');
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateRecognizer = async (id: string) => {
    const original = customRecognizers.find(r => r.id === id);
    if (!original) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duplicate: CustomRecognizer = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCustomRecognizers(prev => [...prev, duplicate]);
    } catch (err) {
      setError('Failed to duplicate recognizer');
    } finally {
      setIsLoading(false);
    }
  };

  const testRecognizers = async (
    text: string, 
    recognizerIds: string[] = []
  ): Promise<TestResult> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allRecognizers = [...predefinedRecognizers, ...customRecognizers];
      const activeRecognizers = allRecognizers.filter(r => 
        r.enabled && (recognizerIds.length === 0 || recognizerIds.includes(r.id))
      );
      
      const matches: PIIMatch[] = [];
      
      activeRecognizers.forEach(recognizer => {
        const patterns = 'patterns' in recognizer && Array.isArray(recognizer.patterns) 
          ? recognizer.patterns.map(p => typeof p === 'string' ? p : p.pattern)
          : recognizer.patterns;
        
        patterns.forEach(pattern => {
          try {
            const regex = new RegExp(pattern, 'gi');
            let match;
            
            while ((match = regex.exec(text)) !== null) {
              matches.push({
                entity: recognizer.entityType,
                matchedText: match[0],
                confidence: 'confidenceScore' in recognizer ? recognizer.confidenceScore : 0.9,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                recognizerId: recognizer.id,
                recognizerName: recognizer.name
              });
            }
          } catch (err) {
            console.error('Error in regex:', pattern, err);
          }
        });
      });
      
      // Remove duplicates and sort by position
      const uniqueMatches = matches
        .filter((match, index, self) => 
          self.findIndex(m => m.startIndex === match.startIndex && m.endIndex === match.endIndex) === index
        )
        .sort((a, b) => a.startIndex - b.startIndex);
      
      // Create anonymized text
      let anonymizedText = text;
      uniqueMatches.reverse().forEach(match => {
        const replacement = `[${match.entity}]`;
        anonymizedText = anonymizedText.substring(0, match.startIndex) + 
                        replacement + 
                        anonymizedText.substring(match.endIndex);
      });
      
      return {
        matches: uniqueMatches,
        originalText: text,
        anonymizedText,
        processingTime: Math.floor(Math.random() * 500) + 100
      };
    } catch (err) {
      setError('Failed to test recognizers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    predefinedRecognizers,
    customRecognizers,
    isLoading,
    error,
    toggleRecognizer,
    createRecognizer,
    deleteRecognizer,
    duplicateRecognizer,
    testRecognizers
  };
}