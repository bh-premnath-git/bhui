import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Eye, 
  EyeOff, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Shield
} from 'lucide-react';
import { PIIMatch, TestResult } from '@/types/admin/pii';
import { usePII } from './hooks/usePII';
import { cn } from '@/lib/utils';

const sampleTexts = [
  {
    id: 'email-phone',
    name: 'Email & Phone',
    text: 'Please contact John Doe at john.doe@company.com or call him at (555) 123-4567 for more information.'
  },
  {
    id: 'ssn-address',
    name: 'SSN & Address',
    text: 'Employee record: SSN 123-45-6789, residing at 123 Main Street, New York, NY 10001.'
  },
  {
    id: 'credit-card',
    name: 'Credit Card',
    text: 'Payment processed using card number 4532-1234-5678-9012 with expiry date 12/25.'
  },
  {
    id: 'mixed-data',
    name: 'Mixed Data',
    text: 'Customer Profile: Name: Jane Smith, Email: jane.smith@email.com, Phone: (555) 987-6543, SSN: 987-65-4321, Address: 456 Oak Ave, Los Angeles, CA 90210, Credit Card: 5555-4444-3333-2222'
  }
];

export function TestValidate() {
  const { testRecognizers, isLoading } = usePII();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<TestResult | null>(null);
  const [showAnonymized, setShowAnonymized] = useState(false);
  const [selectedRecognizers, setSelectedRecognizers] = useState<string[]>([]);
  const [showConfidenceFilter, setShowConfidenceFilter] = useState(false);

  const handleTest = async () => {
    if (!inputText.trim()) return;
    
    try {
      const testResult = await testRecognizers(inputText, selectedRecognizers);
      setResults(testResult);
    } catch (error) {
      console.error('Error testing recognizers:', error);
    }
  };

  const handleSampleSelect = (sampleText: string) => {
    setInputText(sampleText);
    setResults(null);
  };

  const handleAnonymize = () => {
    setShowAnonymized(true);
  };

  const handleDeAnonymize = () => {
    setShowAnonymized(false);
  };

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      originalText: results.originalText,
      anonymizedText: results.anonymizedText,
      matches: results.matches,
      processingTime: results.processingTime,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pii-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHighlightedText = (text: string, matches: PIIMatch[]) => {
    if (!matches.length) return text;
    
    const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);
    let highlightedText = '';
    let lastIndex = 0;
    
    sortedMatches.forEach((match, index) => {
      // Add text before match
      highlightedText += text.slice(lastIndex, match.startIndex);
      
      // Add highlighted match
      highlightedText += `<mark class="bg-yellow-200 px-1 rounded" title="${match.recognizerName} (${match.confidence.toFixed(2)})">${match.matchedText}</mark>`;
      
      lastIndex = match.endIndex;
    });
    
    // Add remaining text
    highlightedText += text.slice(lastIndex);
    
    return highlightedText;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Test & Validate</h2>
        <p className="text-sm text-muted-foreground">
          Test your recognizers against sample text and validate their effectiveness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Input Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testInput">Sample Text</Label>
                <Textarea
                  id="testInput"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter or paste text to test for PII detection..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTest}
                  disabled={!inputText.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isLoading ? 'Processing...' : 'Analyze Text'}
                </Button>
                
                {results && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnonymize}
                      disabled={showAnonymized}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Anonymize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeAnonymize}
                      disabled={!showAnonymized}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      De-anonymize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportResults}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.matches.length}
                    </div>
                    <div className="text-sm text-blue-600">Matches Found</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(results.matches.map(m => m.entity)).size}
                    </div>
                    <div className="text-sm text-green-600">Entity Types</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {results.matches.length > 0 
                        ? (results.matches.reduce((sum, m) => sum + m.confidence, 0) / results.matches.length).toFixed(2)
                        : '0.00'
                      }
                    </div>
                    <div className="text-sm text-orange-600">Avg Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.processingTime}ms
                    </div>
                    <div className="text-sm text-purple-600">Processing Time</div>
                  </div>
                </div>

                {/* Highlighted Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Processed Text</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="show-anonymized"
                        checked={showAnonymized}
                        onCheckedChange={setShowAnonymized}
                      />
                      <Label htmlFor="show-anonymized" className="text-sm">
                        Show Anonymized
                      </Label>
                    </div>
                  </div>
                  <div 
                    className="p-4 border rounded-lg bg-background font-mono text-sm min-h-[100px]"
                    dangerouslySetInnerHTML={{
                      __html: getHighlightedText(
                        showAnonymized ? results.anonymizedText : results.originalText,
                        showAnonymized ? [] : results.matches
                      )
                    }}
                  />
                </div>

                {/* Matches List */}
                {results.matches.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Detected Entities</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {results.matches.map((match, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {match.entity}
                            </Badge>
                            <Badge 
                              variant={match.confidence >= 0.8 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {match.confidence.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {match.matchedText}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.recognizerName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.matches.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>No PII detected in the provided text</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sample Texts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sample Texts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleTexts.map(sample => (
                <Button
                  key={sample.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleSampleSelect(sample.text)}
                >
                  <div>
                    <div className="font-medium">{sample.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {sample.text.substring(0, 50)}...
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Clear Text
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="confidence-filter" className="text-sm">
                  Show Confidence
                </Label>
                <Switch
                  id="confidence-filter"
                  checked={showConfidenceFilter}
                  onCheckedChange={setShowConfidenceFilter}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-sm">Active Recognizers</Label>
                <div className="text-xs text-muted-foreground">
                  All recognizers are currently active
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}