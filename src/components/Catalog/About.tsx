import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, Avatar, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton,
  MenuItem
} from '@mui/material';
import { Link as LinkIcon, Plus, Save, X } from 'lucide-react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { ApiService } from '@/services/apiServices';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const mockApiCall = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

interface LinkData {
  url: string;
  title: string;
}

interface OwnerData {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

function DescriptionSection({
  description,
  isEditingDesc,
  onDescriptionChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  description: string;
  isEditingDesc: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          About
        </Typography>
      </Stack>

      {isEditingDesc ? (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="text"
              onClick={onCancelEdit}
              sx={{
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20, color: 'error.main' }} />
            </Button>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={onDescriptionChange}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="text"
              onClick={onSaveEdit}
              sx={{
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              <SaveIcon sx={{ fontSize: 20, color: 'black' }} />
            </Button>
          </Stack>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={onStartEdit}
            sx={{
              color: 'primary.main',
              textTransform: 'none',
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16, color: 'black' }} />
          </Button>
        </>
      )}
    </Box>
  );
}

function LinksSection({
  links,
  onRemoveLink,
}: {
  links: LinkData[];
  onRemoveLink: (index: number) => void;
}) {
  if (!links.length) return null;
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Links
      </Typography>
      <Stack spacing={1}>
        {links.map((link, index) => (
          <Box
            key={index}
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: 'background.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="body2"
              component="a"
              href={link.url}
              target="_blank"
              sx={{ color: 'black', '&:hover': { color: 'primary.main' } }}
            >
              {link.title}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onRemoveLink(index)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                },
              }}
            >
              <X size={14} />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function OwnersSection({
  owners,
  onOpenOwnerDialog,
}: {
  owners: OwnerData[];
  onOpenOwnerDialog: () => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Owners
        </Typography>
        <Button
          startIcon={<Plus size={14} />}
          variant="outlined"
          size="small"
          onClick={onOpenOwnerDialog}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            width: '125px',
          }}
        >
          Add Owner
        </Button>
      </Stack>
      <Stack spacing={1}>
        {owners.map((owner) => (
          <Stack key={owner.id} direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'grey.200',
                color: '#1a1732',
                fontSize: '0.875rem',
              }}
            >
              {owner.name.split(' ').length > 1
                ? owner.name
                  .split(' ')
                  .map((namePart) => namePart.charAt(0).toUpperCase())
                  .join('')
                : owner.name.charAt(0).toUpperCase() +
                owner.name.charAt(owner.name.length - 1).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {owner.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {owner.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {owner.email}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function TagsSection({
  tags,
  onOpenTagDialog,
  onDeleteTag,
}: {
  tags: string[];
  onOpenTagDialog: () => void;
  onDeleteTag: (index: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Tags
        </Typography>
        <Button
          startIcon={<Plus size={14} />}
          variant="outlined"
          size="small"
          onClick={onOpenTagDialog}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            width: '125px',
          }}
        >
          Add Tags
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            onDelete={() => onDeleteTag(index)}
            sx={{
              borderRadius: '4px',
              backgroundColor: 'primary.lighter',
              color: '#20405f',
              height: '24px',
              fontSize: '0.75rem',
              '& .MuiChip-deleteIcon': {
                '&:hover': {
                  color: 'error.main',
                },
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function AddLinkDialog({
  open,
  onClose,
  newLink,
  onChangeNewLink,
  onAddLink,
}: {
  open: boolean;
  onClose: () => void;
  newLink: LinkData;
  onChangeNewLink: (field: keyof LinkData, value: string) => void;
  onAddLink: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Link
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#1a1a1a' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={newLink.title}
            onChange={(e) => onChangeNewLink('title', e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1a1a1a',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
          <TextField
            label="URL"
            fullWidth
            value={newLink.url}
            onChange={(e) => onChangeNewLink('url', e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1a1a1a',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onAddLink}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
        >
          <Save className="h-5 w-5" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddOwnerDialog({
  open,
  onClose,
  newOwner,
  onChangeNewOwner,
  roles,
  onAddOwner,
}: {
  open: boolean;
  onClose: () => void;
  newOwner: { name: string; role: string; email: string };
  onChangeNewOwner: (field: 'name' | 'role' | 'email', value: string) => void;
  roles: string[];
  onAddOwner: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Owner
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#1a1a1a' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            value={newOwner.name}
            onChange={(e) => onChangeNewOwner('name', e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1a1a1a',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
          <TextField
            select
            label="Role"
            fullWidth
            value={newOwner.role}
            onChange={(e) => onChangeNewOwner('role', e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1a1a1a',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          >
            {roles.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email"
            fullWidth
            value={newOwner.email}
            onChange={(e) => onChangeNewOwner('email', e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1a1a1a',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          onClick={onAddOwner}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
        >
          <Save className="h-5 w-5" />
        </Button>
      </DialogActions>
    </Dialog>)
}

function AddTagDialog({
  open,
  onClose,
  newTag,
  onChangeNewTag,
  onAddTag,
}: {
  open: boolean;
  onClose: () => void;
  newTag: string;
  onChangeNewTag: (value: string) => void;
  onAddTag: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Tag
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#1a1a1a' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tag"
          fullWidth
          value={newTag}
          onChange={(e) => onChangeNewTag(e.target.value)}
          sx={{
            mt: 1,
            '& .MuiInputLabel-root': {
              color: '#1a1a1a',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a1a1a',
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onAddTag}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
        >
          <Save className="h-5 w-5" />
        </Button>
      </DialogActions>
    </Dialog>)
}

export default function About(data: any) {
  const roles = ['admin-user', 'ops-user', 'designer-user'];
  const [description, setDescription] = useState(
    'Sample Description about the data source. This needs to be updated by the user.'
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Dialog states
  const [linkDialog, setLinkDialog] = useState(false);
  const [ownerDialog, setOwnerDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);

  // Form states
  const [newLink, setNewLink] = useState<LinkData>({ url: '', title: '' });
  const [newOwner, setNewOwner] = useState({ name: '', role: '', email: '' });
  const [newTag, setNewTag] = useState('');

  const handleClickEdit = async () => {
    try {

      const body = {
        operation_type: 'datasource_description',
        thread_id: 'desc_123',
        params: {
          source_name: data.sourceName,
          fields: data.passValues,
        },
      };
      const descriptionResponse = await ApiService('8090', 'post', '/pipeline_agent/generate', body);
      const desContent = (JSON.parse(descriptionResponse.result)).description
      setDescription(desContent)
      setIsEditingDesc(true);
      toast.success('Description updated successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('API Error:', error);

      toast.error('Failed to update description', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleDescriptionSave = () => {
    setIsEditingDesc(false);
    toast.success('Description saved locally', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleAddLink = async () => {
    try {
      const body = { link: newLink };
      await mockApiCall({ body });
      setLinks([...links, newLink]);
      setLinkDialog(false);
      setNewLink({ url: '', title: '' });
      toast.success('Link added successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add link', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleAddOwner = async () => {
    try {
      const owner = {
        id: Math.random().toString(36).substr(2, 9),
        ...newOwner,
      };

      const body = { owner };
      await mockApiCall({ body });
      setOwners([...owners, owner]);
      setOwnerDialog(false);
      setNewOwner({ name: '', role: '', email: '' });
      toast.success('Owner added successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add owner', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Handle tag add
  const handleAddTag = async () => {
    try {
      const body = { tag: newTag };
      await mockApiCall({ body });
      setTags([...tags, newTag]);
      setTagDialog(false);
      setNewTag('');
      toast.success('Tag added successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add tag', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  /** RENDER */

  return (
    <Box
      sx={{
        p: 2.5,
        height: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <DescriptionSection
            description={description}
            isEditingDesc={isEditingDesc}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onStartEdit={handleClickEdit}
            onSaveEdit={handleDescriptionSave}
            onCancelEdit={() => setIsEditingDesc(false)}
          />
          <Box>
            {!isEditingDesc && (
              <Button
                startIcon={<LinkIcon size={14} />}
                variant="outlined"
                size="small"
                onClick={() => setLinkDialog(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1,
                  width: '125px',
                  ml: 2,
                }}
              >
                Add Link
              </Button>
            )}
          </Box>
        </Stack>

        {/* Links Section */}
        <LinksSection
          links={links}
          onRemoveLink={(index) => setLinks(links.filter((_, i) => i !== index))}
        />

        {/* Owners Section */}
        <OwnersSection owners={owners} onOpenOwnerDialog={() => setOwnerDialog(true)} />

        {/* Tags Section */}
        <TagsSection
          tags={tags}
          onOpenTagDialog={() => setTagDialog(true)}
          onDeleteTag={(index) => setTags(tags.filter((_, i) => i !== index))}
        />
      </Stack>

      {/* Add Link Dialog */}
      <AddLinkDialog
        open={linkDialog}
        onClose={() => setLinkDialog(false)}
        newLink={newLink}
        onChangeNewLink={(field, value) => setNewLink({ ...newLink, [field]: value })}
        onAddLink={handleAddLink}
      />

      {/* Add Owner Dialog */}
      <AddOwnerDialog
        open={ownerDialog}
        onClose={() => setOwnerDialog(false)}
        newOwner={newOwner}
        onChangeNewOwner={(field, value) => setNewOwner({ ...newOwner, [field]: value })}
        roles={roles}
        onAddOwner={handleAddOwner}
      />

      {/* Add Tag Dialog */}
      <AddTagDialog
        open={tagDialog}
        onClose={() => setTagDialog(false)}
        newTag={newTag}
        onChangeNewTag={(value) => setNewTag(value)}
        onAddTag={handleAddTag}
      />

      {/* Last Updated Info */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 3,
          pt: 2,
          borderTop: '1px dashed',
          borderColor: 'divider',
        }}
      >
        Last Updated On: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
}
