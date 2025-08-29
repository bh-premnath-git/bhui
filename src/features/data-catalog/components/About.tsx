import { useState, useCallback, useEffect } from 'react';
import { Plus, X, Link as LinkIcon, Users, Tag, Gavel } from 'lucide-react';
import { FaSave, FaEdit, FaTimes } from 'react-icons/fa';
import { useAboutData } from '@/features/data-catalog/components/hooks/useAboutData';
import { Owner, Link, AboutData } from '@/features/data-catalog/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast, Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { apiService } from '@/lib/api/api-service';
import { AGENT_REMOTE_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { useDispatch } from 'react-redux';
import { getConnectionConfigList } from '@/store/slices/dataCatalog/datasourceSlice';
import { AppDispatch } from '@/store';
import { useAppSelector } from '@/hooks/useRedux';

interface DescriptionSectionProps {
  description: string;
  isEditingDesc: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateWithBot: () => void;
  onManualEdit: () => void;
  onManualSave: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  botStatus: 'idle' | 'loading' | 'success' | 'error';
  hasChanges: boolean;
}

function DescriptionSection({
  description,
  isEditingDesc,
  onDescriptionChange,
  onGenerateWithBot,
  onManualEdit,
  onManualSave,
  onSaveEdit,
  onCancelEdit,
  botStatus,
  hasChanges,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      {isEditingDesc ? (
        <>
          <Textarea
            value={description}
            onChange={onDescriptionChange}
            rows={3}
            placeholder="Write your description here..."
            className="w-full resize-none"
          />
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveEdit}
                className="p-0 h-auto"
              >
                <FaSave className="h-4 w-4 text-black" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="p-0 h-auto"
            >
              <FaTimes className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerateWithBot}
                    disabled={botStatus === 'loading'}
                    className={cn(
                      'p-0 h-auto',
                      botStatus === 'error' && 'text-red-500',
                      botStatus === 'success' && 'text-green-500'
                    )}
                  >
                    {botStatus === 'loading' ? (
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
                    ) : (
                      <Gavel className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate Description with Bot</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onManualEdit}
                    className="p-0 h-auto"
                  >
                    <FaEdit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to Manual Edit Mode</TooltipContent>
              </Tooltip>
              {hasChanges && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onManualSave}
                      className="p-0 h-auto"
                    >
                      <FaSave className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Current Description</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
}

function TagsSection({ tags, onDeleteTag }: { tags: string[], onDeleteTag: (index: number) => void }) {
  if (!tags.length) {
    return <p className="text-sm text-muted-foreground">No tags have been added.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 bg-background p-2 rounded-md mt-2">
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs cursor-pointer"
          onClick={() => onDeleteTag(index)}
        >
          {tag}
          <X className="h-3 w-3 ml-1 hover:text-red-500" />
        </Badge>
      ))}
    </div>
  );
}

function LinksSection({ links, onRemoveLink }: { links: Link[], onRemoveLink: (index: number) => void }) {
  if (!links.length) {
    return <p className="text-sm text-muted-foreground">No links added yet.</p>;
  }

  return (
    <ul className="space-y-2 mt-2">
      {links.map((link, index) => (
        <li
          key={index}
          className="flex justify-between items-center bg-background p-2 rounded-md"
        >
          <div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              {link.title}
            </a>
            <p className="text-xs text-muted-foreground">{link.url}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveLink(index)}
            className="text-muted-foreground hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function OwnersSection({ owners, onRemoveOwner }: { owners: Owner[]; onRemoveOwner: (id: string) => void }) {
  if (!owners.length) {
    return <p className="text-sm text-muted-foreground">No owners have been added.</p>;
  }

  return (
    <ul className="space-y-2 mt-2">
      {owners.map((owner) => (
        <li
          key={owner.id}
          className="flex items-center gap-3 bg-background p-2 rounded-md"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200 text-gray-800">
              {owner.name.split(' ').length > 1
                ? owner.name
                  .split(' ')
                  .map((n) => n[0].toUpperCase())
                  .join('')
                : owner.name[0].toUpperCase() +
                owner.name[owner.name.length - 1].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{owner.name}</p>
            <p className="text-xs text-muted-foreground">{owner.role}</p>
            <p className="text-xs text-muted-foreground">{owner.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveOwner(owner.id)}
            className="ml-auto text-muted-foreground hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

type NewOwner = Omit<Owner, 'id'>;

function AddOwnerDialog({
  open,
  onClose,
  onAddOwner,
}: {
  open: boolean;
  onClose: () => void;
  onAddOwner: (owner: NewOwner) => void;
}) {
  const [newOwner, setNewOwner] = useState<NewOwner>({ name: '', role: '', email: '' });
  const [error, setError] = useState<string | null>(null);
  const roles = ['Admin', 'Editor', 'Viewer'];

  const handleAdd = useCallback(() => {
    if (!newOwner.name.trim() || !newOwner.role.trim() || !newOwner.email.trim()) {
      setError('Please fill out all fields');
      return;
    }
    onAddOwner(newOwner);
    setNewOwner({ name: '', role: '', email: '' });
    setError(null);
    onClose();
  }, [newOwner, onAddOwner, onClose]);

  const handleClose = useCallback(() => {
    setNewOwner({ name: '', role: '', email: '' });
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Owner</DialogTitle>
          <DialogDescription>
            Enter the details for the new owner.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="owner-name">Name</Label>
            <Input
              id="owner-name"
              value={newOwner.name}
              onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <Label htmlFor="owner-role">Role</Label>
            <Select
              value={newOwner.role}
              onValueChange={(value) => setNewOwner({ ...newOwner, role: value })}
            >
              <SelectTrigger id="owner-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="owner-email">Email</Label>
            <Input
              id="owner-email"
              value={newOwner.email}
              onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
              placeholder="john@example.com"
              type="email"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Owner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTagDialog({
  open,
  onClose,
  onAddTag
}: {
  open: boolean;
  onClose: () => void;
  onAddTag: (tag: string) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newTag.trim()) {
      setError('Please enter a tag name');
      return;
    }
    onAddTag(newTag);
    setNewTag('');
    setError(null);
    onClose();
  }, [newTag, onAddTag, onClose]);

  const handleClose = useCallback(() => {
    setNewTag('');
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>
            Enter a new tag to add to this item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tag">Tag Name</Label>
            <Input
              id="tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. important, draft"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLinkDialog({
  open,
  onClose,
  onAddLink,
}: {
  open: boolean;
  onClose: () => void;
  onAddLink: (link: Link) => void;
}) {
  const [newLink, setNewLink] = useState<Link>({ url: '', title: '' });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      setError('Please fill out all fields');
      return;
    }
    onAddLink(newLink);
    setNewLink({ url: '', title: '' });
    setError(null);
    onClose();
  }, [newLink, onAddLink, onClose]);

  const handleClose = useCallback(() => {
    setNewLink({ url: '', title: '' });
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription>
            Enter the details for the new link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="link-title">Title</Label>
            <Input
              id="link-title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="e.g. Documentation"
            />
          </div>
          <div>
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function About({ initialData = {} as AboutData, selectedSource, columns }: { initialData?: AboutData, selectedSource: DataSource, columns: any }) {
  const {
    links,
    owners,
    tags,
    lastUpdated,
    handleSaveDescription,
    handleAddLink,
    handleAddOwner,
    handleAddTag,
    handleRemoveLink,
    handleRemoveOwner,
    handleRemoveTag,
  } = useAboutData(initialData);
  const defaultDescription = selectedSource.data_src_desc ?? 'Sample Description about the data source.';
  const [descriptionState, setDescriptionState] = useState({
    current: defaultDescription,
    original: defaultDescription
  });
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [botStatus, setBotStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedConnection, setSelectedConnection] = useState<string | null>(
    selectedSource.connection_config_id?.toString() || null
  );
  const [isConnectionChanged, setIsConnectionChanged] = useState(false);
  const { connectionConfigList } = useAppSelector((state) => state.datasource);
  const hasChanges = descriptionState.current !== descriptionState.original;

  // Fetch connection configs on mount
  useEffect(() => {
    dispatch(getConnectionConfigList({ offset: 0, limit: 1000 }));
  }, [dispatch]);

  const handleGenerateWithBot = async () => {
    setBotStatus('loading');
    try {
      const body = {
        operation_type: 'datasource_description',
        thread_id: 'desc_123',
        params: {
          source_name: selectedSource.data_src_name,
          fields: columns,
        },
      };

      const descriptionResponse: any = await apiService.post(
        {
          baseUrl: AGENT_REMOTE_URL,
          method: 'POST',
          url: '/generic/',
          data: body,
          usePrefix: true,
          metadata: {
            errorMessage: `Failed to generate description for about`
          }
        }
      );

      const desContent = JSON.parse(descriptionResponse.result).description;

      setDescriptionState(prev => ({
        ...prev,
        current: desContent
      }));
      setBotStatus('success');
      toast.success('Description updated by Bot');
    } catch (error) {
      setBotStatus('error');
      toast.error('Failed to generate description');
    }
  };

  const handleManualEdit = () => {
    setIsEditingDesc(true);
  };

  const handleManualSave = async () => {
    setDescriptionState(prev => ({
      ...prev,
      original: prev.current
    }));
    handleSaveDescription(selectedSource.data_src_id, descriptionState.current);
    toast.success('Description saved');
  };

  const handleDescriptionSave = async () => {
    setDescriptionState(prev => ({
      ...prev,
      original: prev.current
    }));
    handleSaveDescription(selectedSource.data_src_id, descriptionState.current);
    setIsEditingDesc(false);
    toast.success('Description saved');
  };

  const handleCancelEdit = () => {
    setDescriptionState(prev => ({
      ...prev,
      current: prev.original
    }));
    setIsEditingDesc(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionState(prev => ({
      ...prev,
      current: e.target.value
    }));
  };

  const handleConnectionChange = (value: string) => {
    setSelectedConnection(value);
    setIsConnectionChanged(true);
  };

  const handleUpdateConnection = async () => {
    try {
      let connectionConfig=connectionConfigList.find((item:any)=>item.id===parseInt(selectedConnection!,10));
      await apiService.patch({
        url: `/data_source/${selectedSource.data_src_id}`,
        baseUrl: CATALOG_REMOTE_API_URL,
        method: 'PATCH',
        usePrefix: true,
        data: {
          connection_config_id: parseInt(selectedConnection!, 10),
          file_path_prefix: connectionConfig?.custom_metadata?.file_path_prefix,
          connection_type: connectionConfig?.connection_name
        },
        metadata: {
          successMessage: 'Connection updated successfully',
          errorMessage: 'Failed to update connection'
        }
      });
      setIsConnectionChanged(false);
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <Toaster />
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">About</h3>
        </CardHeader>
        <CardContent className="pt-0 max-h-[200px] overflow-y-auto">
          <DescriptionSection
            description={descriptionState.current}
            isEditingDesc={isEditingDesc}
            onDescriptionChange={handleDescriptionChange}
            onGenerateWithBot={handleGenerateWithBot}
            onManualEdit={handleManualEdit}
            onManualSave={handleManualSave}
            onSaveEdit={handleDescriptionSave}
            onCancelEdit={handleCancelEdit}
            botStatus={botStatus}
            hasChanges={hasChanges}
          />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">Connection</h3>
          {isConnectionChanged && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateConnection}
              className="flex items-center gap-2"
            >
              Update
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0 max-h-[150px] overflow-y-auto">
          <div className="space-y-2">
            <Select
              value={selectedConnection || ''}
              onValueChange={handleConnectionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {connectionConfigList?.map((config: any) => (
                  <SelectItem key={config.id} value={config.id.toString()}>
                                {config.connection_config_name} ({config.custom_metadata?.type})
                                </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedConnection && (
              <p className="text-sm text-muted-foreground">No connection configured.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <Card className="h-fit">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">Links</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <LinkIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0 max-h-[200px] overflow-y-auto">
          <LinksSection links={links} onRemoveLink={handleRemoveLink} />
        </CardContent>
      </Card> */}

      <Card className="h-fit">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">Owners</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOwnerDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <Users className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0 max-h-[200px] overflow-y-auto">
          <OwnersSection owners={owners} onRemoveOwner={handleRemoveOwner} />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">Tags</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTagDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <Tag className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0 max-h-[150px] overflow-y-auto">
          <TagsSection tags={tags} onDeleteTag={handleRemoveTag} />
        </CardContent>
      </Card>

      <AddLinkDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onAddLink={handleAddLink}
      />

      <AddOwnerDialog
        open={ownerDialogOpen}
        onClose={() => setOwnerDialogOpen(false)}
        onAddOwner={handleAddOwner}
      />

      <AddTagDialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        onAddTag={handleAddTag}
      />

      <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-dashed text-right">
        Last Updated: {lastUpdated.toLocaleString()}
      </p>
    </div>
  );
}