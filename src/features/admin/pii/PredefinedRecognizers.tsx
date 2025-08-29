import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Phone, 
  CreditCard, 
  IdCard, 
  MapPin, 
  Calendar, 
  Search,
  Shield,
  Filter
} from 'lucide-react';
import { PredefinedRecognizer } from '@/types/admin/pii';
import { usePII } from './hooks/usePII';

const categoryIcons = {
  personal: Mail,
  financial: CreditCard,
  medical: IdCard,
  government: Shield,
  other: MapPin
};

const categoryColors = {
  personal: 'bg-blue-100 text-blue-800 border-blue-200',
  financial: 'bg-green-100 text-green-800 border-green-200',
  medical: 'bg-red-100 text-red-800 border-red-200',
  government: 'bg-purple-100 text-purple-800 border-purple-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function PredefinedRecognizers() {
  const { predefinedRecognizers, toggleRecognizer, isLoading } = usePII();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecognizers = predefinedRecognizers.filter(recognizer => {
    const matchesSearch = recognizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recognizer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recognizer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(predefinedRecognizers.map(r => r.category)))];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Built-in Recognizers</h2>
          <p className="text-sm text-muted-foreground">
            Pre-configured recognizers for common PII types
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {predefinedRecognizers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Recognizers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {predefinedRecognizers.filter(r => r.enabled).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {predefinedRecognizers.filter(r => !r.enabled).length}
            </div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {categories.length - 1}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Recognizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecognizers.map((recognizer) => {
          const IconComponent = categoryIcons[recognizer.category] || Shield;
          return (
            <Card
              key={recognizer.id}
              className={cn(
                'relative transition-all duration-200 hover:shadow-md',
                recognizer.enabled 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-200 bg-gray-50/30'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{recognizer.name}</CardTitle>
                  </div>
                  <Switch
                    checked={recognizer.enabled}
                    onCheckedChange={() => toggleRecognizer(recognizer.id)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', categoryColors[recognizer.category])}
                  >
                    {recognizer.category.charAt(0).toUpperCase() + recognizer.category.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {recognizer.entityType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {recognizer.description}
                </p>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Pattern Examples:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recognizer.patterns.slice(0, 2).map((pattern, index) => (
                      <code 
                        key={index}
                        className="px-2 py-1 bg-muted text-xs rounded font-mono"
                      >
                        {pattern.length > 20 ? pattern.substring(0, 20) + '...' : pattern}
                      </code>
                    ))}
                    {recognizer.patterns.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{recognizer.patterns.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecognizers.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No recognizers found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}