import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Play, 
  IdCard, 
  Mail, 
  Phone,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  Code,
  Lightbulb
} from 'lucide-react';
import { RegexPattern, RecognizerTemplate } from '@/types/admin/pii';
import { usePII } from './hooks/usePII';
import { cn } from '@/lib/utils';

const templates: RecognizerTemplate[] = [
  {
    id: 'employee-id',
    name: 'Employee ID',
    description: 'Company employee identification numbers',
    entityType: 'EMPLOYEE_ID',
    patterns: [
      { id: '1', name: 'Standard Format', pattern: '^EMP[0-9]{4}$', description: 'EMP followed by 4 digits' },
      { id: '2', name: 'Extended Format', pattern: '^E[0-9]{6}$', description: 'E followed by 6 digits' }
    ],
    contextWords: ['employee', 'staff', 'worker', 'emp'],
    confidenceScore: 0.85,
    category: 'Corporate'
  },
  {
    id: 'project-code',
    name: 'Project Code',
    description: 'Internal project identification codes',
    entityType: 'PROJECT_CODE',
    patterns: [
      { id: '1', name: 'Standard Format', pattern: '^PRJ-[A-Z]{3}-[0-9]{4}$', description: 'PRJ-ABC-1234 format' },
      { id: '2', name: 'Short Format', pattern: '^P[0-9]{4}$', description: 'P followed by 4 digits' }
    ],
    contextWords: ['project', 'code', 'prj', 'initiative'],
    confidenceScore: 0.9,
    category: 'Corporate'
  },
  {
    id: 'customer-id',
    name: 'Customer ID',
    description: 'Customer identification numbers',
    entityType: 'CUSTOMER_ID',
    patterns: [
      { id: '1', name: 'Standard Format', pattern: '^CUST[0-9]{6}$', description: 'CUST followed by 6 digits' },
      { id: '2', name: 'UUID Format', pattern: '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', description: 'UUID format' }
    ],
    contextWords: ['customer', 'client', 'cust', 'account'],
    confidenceScore: 0.8,
    category: 'Business'
  }
];

export function CreateRecognizer() {
  const { createRecognizer, isLoading } = usePII();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: '',
    patterns: [] as RegexPattern[],
    contextWords: [] as string[],
    confidenceScore: [0.8] as number[]
  });
  const [newPattern, setNewPattern] = useState({ name: '', pattern: '', description: '' });
  const [contextWordsInput, setContextWordsInput] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<{ pattern: string; matches: boolean; error?: string }[]>([]);

  const handleTemplateSelect = (template: RecognizerTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      entityType: template.entityType,
      patterns: template.patterns,
      contextWords: template.contextWords,
      confidenceScore: [template.confidenceScore]
    });
    setContextWordsInput(template.contextWords.join(', '));
  };

  const addPattern = () => {
    if (newPattern.name && newPattern.pattern) {
      const pattern: RegexPattern = {
        id: Date.now().toString(),
        name: newPattern.name,
        pattern: newPattern.pattern,
        description: newPattern.description
      };
      setFormData(prev => ({
        ...prev,
        patterns: [...prev.patterns, pattern]
      }));
      setNewPattern({ name: '', pattern: '', description: '' });
    }
  };

  const removePattern = (id: string) => {
    setFormData(prev => ({
      ...prev,
      patterns: prev.patterns.filter(p => p.id !== id)
    }));
  };

  const updateContextWords = (value: string) => {
    setContextWordsInput(value);
    const words = value.split(',').map(w => w.trim()).filter(w => w);
    setFormData(prev => ({ ...prev, contextWords: words }));
  };

  const testPatterns = () => {
    const results = formData.patterns.map(pattern => {
      try {
        const regex = new RegExp(pattern.pattern, 'gi');
        const matches = regex.test(testInput);
        return { pattern: pattern.name, matches, error: undefined };
      } catch (error) {
        return { 
          pattern: pattern.name, 
          matches: false, 
          error: (error as Error).message 
        };
      }
    });
    setTestResults(results);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.entityType || formData.patterns.length === 0) {
      return;
    }

    try {
      await createRecognizer({
        name: formData.name,
        description: formData.description,
        entityType: formData.entityType,
        patterns: formData.patterns,
        contextWords: formData.contextWords,
        confidenceScore: formData.confidenceScore[0]
      });
      // Reset form
      setFormData({
        name: '',
        description: '',
        entityType: '',
        patterns: [],
        contextWords: [],
        confidenceScore: [0.8]
      });
      setContextWordsInput('');
    } catch (error) {
      console.error('Error creating recognizer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Create New Recognizer</h2>
        <p className="text-sm text-muted-foreground">
          Create custom recognizers for specific PII patterns in your organization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(template => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IdCard className="w-4 h-4 text-primary" />
                      <div className="font-medium text-sm">{template.name}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {template.patterns.length} pattern{template.patterns.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.confidenceScore.toFixed(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Employee ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="entityType">Entity Type *</Label>
                    <Input
                      id="entityType"
                      value={formData.entityType}
                      onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                      placeholder="e.g., EMPLOYEE_ID"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this recognizer identifies..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regex Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Pattern Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="patternName">Pattern Name</Label>
                    <Input
                      id="patternName"
                      value={newPattern.name}
                      onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Standard Format"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patternRegex">Regex Pattern</Label>
                    <Input
                      id="patternRegex"
                      value={newPattern.pattern}
                      onChange={(e) => setNewPattern(prev => ({ ...prev, pattern: e.target.value }))}
                      placeholder="e.g., ^EMP[0-9]{4}$"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addPattern} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Pattern
                    </Button>
                  </div>
                </div>

                {/* Existing Patterns */}
                {formData.patterns.length > 0 && (
                  <div className="space-y-2">
                    {formData.patterns.map(pattern => (
                      <div key={pattern.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{pattern.name}</div>
                          <code className="text-xs text-muted-foreground">{pattern.pattern}</code>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePattern(pattern.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contextWords">Context Words</Label>
                  <Input
                    id="contextWords"
                    value={contextWordsInput}
                    onChange={(e) => updateContextWords(e.target.value)}
                    placeholder="employee, staff, worker (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Words that typically appear near this PII type
                  </p>
                </div>
                <div>
                  <Label>Confidence Score: {formData.confidenceScore[0].toFixed(2)}</Label>
                  <Slider
                    value={formData.confidenceScore}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, confidenceScore: value }))}
                    max={1}
                    min={0}
                    step={0.01}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How confident the system should be in matches (0.0 - 1.0)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testInput">Sample Text</Label>
                  <Textarea
                    id="testInput"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter sample text to test your patterns..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testPatterns}
                    disabled={formData.patterns.length === 0 || !testInput}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test Patterns
                  </Button>
                </div>
                {testResults.length > 0 && (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        {result.error ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : result.matches ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">
                          {result.pattern}: {result.error || (result.matches ? 'Match found' : 'No match')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.name || !formData.entityType || formData.patterns.length === 0}
              >
                {isLoading ? 'Creating...' : 'Create Recognizer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}