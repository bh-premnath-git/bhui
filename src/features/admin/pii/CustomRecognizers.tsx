import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  Settings,
  Calendar,
  Code,
  Target,
  Copy,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomRecognizer } from '@/types/admin/pii';
import { usePII } from './hooks/usePII';
import { EmptyState } from '@/components/shared/EmptyState';

export function CustomRecognizers() {
  const { customRecognizers, deleteRecognizer, duplicateRecognizer, isLoading } = usePII();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecognizers = customRecognizers.filter(recognizer =>
    recognizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recognizer.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (recognizer: CustomRecognizer) => {
    // This would typically open a dialog or navigate to edit page
    console.log('Edit recognizer:', recognizer);
  };

  const handleDelete = (recognizer: CustomRecognizer) => {
    if (window.confirm(`Are you sure you want to delete "${recognizer.name}"?`)) {
      deleteRecognizer(recognizer.id);
    }
  };

  const handleDuplicate = (recognizer: CustomRecognizer) => {
    duplicateRecognizer(recognizer.id);
  };

  if (customRecognizers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Custom Recognizers</h2>
            <p className="text-sm text-muted-foreground">
              User-defined recognizers for specific PII patterns
            </p>
          </div>
        </div>
        
        <EmptyState
          Icon={Settings}
          title="No Custom Recognizers"
          description="Create your first custom recognizer to identify specific PII patterns in your data."
          action={
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Recognizer
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Custom Recognizers</h2>
          <p className="text-sm text-muted-foreground">
            User-defined recognizers for specific PII patterns
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recognizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {customRecognizers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Custom</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {customRecognizers.filter(r => r.enabled).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {customRecognizers.reduce((sum, r) => sum + r.patterns.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Patterns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {(customRecognizers.reduce((sum, r) => sum + r.confidenceScore, 0) / customRecognizers.length).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Recognizers List */}
      <div className="space-y-4">
        {filteredRecognizers.map((recognizer) => (
          <Card key={recognizer.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    recognizer.enabled 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{recognizer.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {recognizer.entityType}
                      </Badge>
                      <Badge 
                        variant={recognizer.enabled ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {recognizer.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(recognizer)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(recognizer)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(recognizer)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recognizer.description && (
                  <p className="text-sm text-muted-foreground">
                    {recognizer.description}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{recognizer.patterns.length}</strong> pattern{recognizer.patterns.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{recognizer.confidenceScore.toFixed(2)}</strong> confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(recognizer.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {recognizer.patterns.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Regex Patterns:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recognizer.patterns.slice(0, 3).map((pattern) => (
                        <code 
                          key={pattern.id}
                          className="px-2 py-1 bg-muted text-xs rounded font-mono"
                        >
                          {pattern.pattern.length > 30 
                            ? pattern.pattern.substring(0, 30) + '...' 
                            : pattern.pattern}
                        </code>
                      ))}
                      {recognizer.patterns.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recognizer.patterns.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {recognizer.contextWords.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Context Words:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recognizer.contextWords.slice(0, 5).map((word, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                      {recognizer.contextWords.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{recognizer.contextWords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecognizers.length === 0 && customRecognizers.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No recognizers found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
}