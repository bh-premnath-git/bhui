'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface HttpOperatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HttpOperator({ open, onOpenChange }: HttpOperatorProps) {
  const [method, setMethod] = React.useState('GET')
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')

  const addTag = (input: string) => {
    const newTags = input.split(',').map(tag => tag.trim()).filter(tag => tag && !tags.includes(tag));
    setTags([...tags, ...newTags]);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>SimpleHttpOperator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="property">Property</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="property" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="conn-id">
                    HTTP CONN ID <span className="text-red-500">*</span>
                  </Label>
                  <Select defaultValue="http_connection_1">
                    <SelectTrigger id="conn-id">
                      <SelectValue placeholder="Select connection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http_connection_1">http_connection_1</SelectItem>
                      <SelectItem value="http_connection_2">http_connection_2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">
                    ENDPOINT <span className="text-red-500">*</span>
                  </Label>
                  <Input id="endpoint" placeholder="ENDPOINT" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">
                    METHOD <span className="text-red-500">*</span>
                  </Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method2">
                    METHOD <span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="method2">
                      <SelectValue placeholder="Select METHOD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="data">DATA</Label>
                  <Textarea
                    id="data"
                    placeholder="DATA"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="headers">HEADERS</Label>
                  <Textarea
                    id="headers"
                    placeholder="HEADERS"
                    className="min-h-[100px] resize-y"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="retry-limit">Retry Limit</Label>
                  <Input id="retry-limit" type="number" placeholder="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input id="timeout" type="number" placeholder="60" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Options</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ssl-verify" />
                      <Label htmlFor="ssl-verify">SSL Verify</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="follow-redirects" />
                      <Label htmlFor="follow-redirects">Follow Redirects</Label>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex items-center p-2 bg-background border rounded-md overflow-x-auto">
                    <div className="flex space-x-2 flex-nowrap">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm whitespace-nowrap">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-xs font-bold"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const newTag = tagInput.trim();
                          if (newTag && !tags.includes(newTag)) {
                            setTags([...tags, newTag]);
                            setTagInput('');
                          }
                        }
                      }}
                      placeholder="Add tags..."
                      className="flex-grow border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <div className="flex justify-center pt-4">
          <Button type="submit">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

