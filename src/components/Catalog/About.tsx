import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import { Bot, Plus, Link, Users, Tag, Save, X } from 'lucide-react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { ApiService } from '@/services/apiServices';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock API call
const mockApiCall = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
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

/** ---------- Description Section ---------- **/
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
}: {
  description: string;
  isEditingDesc: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateWithBot: () => void;
  onManualEdit: () => void;
  onManualSave: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  botStatus: 'idle' | 'loading' | 'success' | 'error';
  hasChanges: boolean;
}) {
  return (
    <Box>
      {isEditingDesc ? (
        <>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={onDescriptionChange}
            size="small"
            placeholder="Write your description here..."
            sx={{ mb: 1 }}
          />

          <Stack direction="row" spacing={1}>
            {/* Conditionally render "Save" icon only if changes exist */}
            {hasChanges && (
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
            )}

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
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Generate Description with Bot">
              <Button
                size="small"
                variant="text"
                onClick={onGenerateWithBot}
                disabled={botStatus === 'loading'}
                sx={{
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  color:
                    botStatus === 'error'
                      ? 'error.main'
                      : botStatus === 'success'
                      ? 'success.main'
                      : 'primary.main',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {botStatus === 'loading' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </Button>
            </Tooltip>

            {/* Manual Edit */}
            <Tooltip title="Switch to Manual Edit Mode">
              <Button
                size="small"
                variant="text"
                onClick={onManualEdit}
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Edit
              </Button>
            </Tooltip>

            {/* Direct "Save" button (optional quick save) */}
            {hasChanges && (
              <Tooltip title="Save Current Description">
                <Button
                  size="small"
                  variant="text"
                  onClick={onManualSave}
                  startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Save
                </Button>
              </Tooltip>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
}

/** ---------- Links Section (using List) ---------- **/
function LinksSection({
  links,
  onRemoveLink,
}: {
  links: LinkData[];
  onRemoveLink: (index: number) => void;
}) {
  if (!links.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No links added yet.
      </Typography>
    );
  }

  return (
    <List dense sx={{ mt: 1 }}>
      {links.map((link, index) => (
        <ListItem
          key={index}
          sx={{
            bgcolor: 'background.default',
            mb: 1,
            borderRadius: 1,
          }}
        >
          <ListItemText
            primary={
              <Typography
                variant="body2"
                component="a"
                href={link.url}
                target="_blank"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {link.title}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {link.url}
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this link?')) {
                  onRemoveLink(index);
                }
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                },
              }}
            >
              <X size={14} />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

/** ---------- Owners Section (using List) ---------- **/
function OwnersSection({ owners }: { owners: OwnerData[] }) {
  if (!owners.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No owners have been added.
      </Typography>
    );
  }

  return (
    <List dense sx={{ mt: 1 }}>
      {owners.map((owner) => (
        <ListItem
          key={owner.id}
          sx={{
            bgcolor: 'background.default',
            mb: 1,
            borderRadius: 1,
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.200', color: '#1a1732' }}>
              {owner.name.split(' ').length > 1
                ? owner.name
                    .split(' ')
                    .map((namePart) => namePart.charAt(0).toUpperCase())
                    .join('')
                : owner.name.charAt(0).toUpperCase() +
                  owner.name.charAt(owner.name.length - 1).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {owner.name}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {owner.role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {owner.email}
                </Typography>
              </>
            }
          />
          {/* If you want remove owners, replicate the X IconButton logic here */}
        </ListItem>
      ))}
    </List>
  );
}

/** ---------- Tags Section (List + Chips) ---------- **/
function TagsSection({
  tags,
  onDeleteTag,
}: {
  tags: string[];
  onDeleteTag: (index: number) => void;
}) {
  if (!tags.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tags have been added.
      </Typography>
    );
  }

  return (
    <List dense sx={{ mt: 1 }}>
      <ListItem
        disablePadding
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: 'background.default',
          p: 1,
          borderRadius: 1,
        }}
      >
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            onDelete={() => {
              if (window.confirm('Are you sure you want to remove this tag?')) {
                onDeleteTag(index);
              }
            }}
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
      </ListItem>
    </List>
  );
}

/** ---------- Dialogs ---------- **/
function AddLinkDialog({
  open,
  onClose,
  newLink,
  onChangeNewLink,
  onAddLink,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  newLink: LinkData;
  onChangeNewLink: (field: keyof LinkData, value: string) => void;
  onAddLink: () => void;
  loading: boolean;
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
            placeholder="e.g. My Personal Website"
            fullWidth
            value={newLink.title}
            onChange={(e) => onChangeNewLink('title', e.target.value)}
            helperText="Enter a title for your link."
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
            placeholder="https://example.com"
            fullWidth
            value={newLink.url}
            onChange={(e) => onChangeNewLink('url', e.target.value)}
            helperText="Enter a valid URL."
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          onClick={onAddLink}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Save className="h-5 w-5" />
          )}
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
  loading,
}: {
  open: boolean;
  onClose: () => void;
  newOwner: { name: string; role: string; email: string };
  onChangeNewOwner: (field: 'name' | 'role' | 'email', value: string) => void;
  roles: string[];
  onAddOwner: () => void;
  loading: boolean;
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
            placeholder="e.g. John Doe"
            fullWidth
            value={newOwner.name}
            onChange={(e) => onChangeNewOwner('name', e.target.value)}
            helperText="Enter the owner's full name."
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
            placeholder="e.g. admin-user"
            fullWidth
            value={newOwner.role}
            onChange={(e) => onChangeNewOwner('role', e.target.value)}
            helperText="Select the owner's role."
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
            placeholder="john@doe.com"
            fullWidth
            value={newOwner.email}
            onChange={(e) => onChangeNewOwner('email', e.target.value)}
            helperText="Enter a valid email address."
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          onClick={onAddOwner}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Save className="h-5 w-5" />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddTagDialog({
  open,
  onClose,
  newTag,
  onChangeNewTag,
  onAddTag,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  newTag: string;
  onChangeNewTag: (value: string) => void;
  onAddTag: () => void;
  loading: boolean;
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
          placeholder="e.g. sales, marketing..."
          fullWidth
          value={newTag}
          onChange={(e) => onChangeNewTag(e.target.value)}
          helperText="Enter a new tag."
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'black' }}>
          Cancel
        </Button>
        <Button
          onClick={onAddTag}
          variant="contained"
          sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'black' } }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Save className="h-5 w-5" />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** ---------- Main Component ---------- **/
export default function About(data: any) {
  const roles = ['admin-user', 'ops-user', 'designer-user'];

  const [description, setDescription] = useState(
    data.description ?? 'Sample Description about the data source. This needs to be updated by the user.'
  );

  // Track the original (last saved) description:
  const [originalDescription, setOriginalDescription] = useState(description);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [botStatus, setBotStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [links, setLinks] = useState<LinkData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [linkDialog, setLinkDialog] = useState(false);
  const [ownerDialog, setOwnerDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);

  const [newLink, setNewLink] = useState<LinkData>({ url: '', title: '' });
  const [newOwner, setNewOwner] = useState({ name: '', role: '', email: '' });
  const [newTag, setNewTag] = useState('');

  const [addLinkLoading, setAddLinkLoading] = useState(false);
  const [addOwnerLoading, setAddOwnerLoading] = useState(false);
  const [addTagLoading, setAddTagLoading] = useState(false);

  const hasChanges = description !== originalDescription;

  const handleSaveDescriptionRemote = async () => {
    try {
      await ApiService(
        '8011',
        'patch',
        `/data_source/${data.dataSource.data_src_id}`,
        { data_src_desc: description }
      );
      toast.success('Description saved to the remote server!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Failed to save description remotely.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Generate description via Bot
  const handleGenerateWithBot = async () => {
    setBotStatus('loading');
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
      const desContent = JSON.parse(descriptionResponse.result).description;
      setDescription(desContent);

      setBotStatus('success');
      toast.success('Description updated by Bot.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('API Error:', error);
      setBotStatus('error');
      toast.error('Failed to generate description', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Manual edit mode
  const handleManualEdit = () => {
    setIsEditingDesc(true);
  };

  // Manual "quick save"
  const handleManualSave = async () => {
    toast.success('Description saved (quick save).', {
      position: 'top-right',
      autoClose: 3000,
    });
    await handleSaveDescriptionRemote();
    // Optionally reset originalDescription, so "hasChanges" updates
    setOriginalDescription(description);
  };

  // Finalize manual edit
  const handleDescriptionSave = async () => {
    // Update original description, so the "Save" button disappears
    setOriginalDescription(description);
    setIsEditingDesc(false);

    toast.success('Description saved (after editing).', {
      position: 'top-right',
      autoClose: 3000,
    });

    // Also save to remote
    await handleSaveDescriptionRemote();
  };

  // Cancel manual edit
  const handleCancelEdit = () => {
    // Revert to original description
    setDescription(originalDescription);
    setIsEditingDesc(false);
  };

  // Add Link
  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error('Please enter both a link title and a valid URL.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setAddLinkLoading(true);
    try {
      await mockApiCall({ link: newLink });
      setLinks([...links, newLink]);
      toast.success('Link added successfully.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add link.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setAddLinkLoading(false);
      setLinkDialog(false);
      setNewLink({ url: '', title: '' });
    }
  };

  // Add Owner
  const handleAddOwner = async () => {
    if (!newOwner.name.trim() || !newOwner.role.trim() || !newOwner.email.trim()) {
      toast.error('Please fill out the name, role, and email.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setAddOwnerLoading(true);
    try {
      const owner = {
        id: Math.random().toString(36).substr(2, 9),
        ...newOwner,
      };
      await mockApiCall({ owner });
      setOwners([...owners, owner]);
      toast.success('Owner added successfully.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add owner.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setAddOwnerLoading(false);
      setOwnerDialog(false);
      setNewOwner({ name: '', role: '', email: '' });
    }
  };

  // Add Tag
  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag name.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setAddTagLoading(true);
    try {
      await mockApiCall({ tag: newTag });
      setTags([...tags, newTag]);
      toast.success('Tag added successfully.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add tag.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setAddTagLoading(false);
      setTagDialog(false);
      setNewTag('');
    }
  };

  return (
    <Box sx={{ p: 2.5, backgroundColor: (theme) => theme.palette.grey[50] }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  About
                </Typography>
              }
            />
            <CardContent>
              <DescriptionSection
                description={description}
                isEditingDesc={isEditingDesc}
                onDescriptionChange={(e) => setDescription(e.target.value)}
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
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Links
                </Typography>
              }
              action={
                <Button
                  startIcon={<Plus size={14} />}
                  variant="outlined"
                  size="small"
                  onClick={() => setLinkDialog(true)}
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  <Link className="w-4 h-4" />
                </Button>
              }
            />
            <CardContent>
              <LinksSection
                links={links}
                onRemoveLink={(index) => {
                  setLinks(links.filter((_, i) => i !== index));
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Owners
                </Typography>
              }
              action={
                <Button
                  startIcon={<Plus size={14} />}
                  variant="outlined"
                  size="small"
                  onClick={() => setOwnerDialog(true)}
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  <Users className="w-4 h-4" />
                </Button>
              }
            />
            <CardContent>
              <OwnersSection owners={owners} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Tags
                </Typography>
              }
              action={
                <Button
                  startIcon={<Plus size={14} />}
                  variant="outlined"
                  size="small"
                  onClick={() => setTagDialog(true)}
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  <Tag className="w-4 h-4" />
                </Button>
              }
            />
            <CardContent>
              <TagsSection
                tags={tags}
                onDeleteTag={(index) => setTags(tags.filter((_, i) => i !== index))}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <AddLinkDialog
        open={linkDialog}
        onClose={() => setLinkDialog(false)}
        newLink={newLink}
        onChangeNewLink={(field, value) => setNewLink({ ...newLink, [field]: value })}
        onAddLink={handleAddLink}
        loading={addLinkLoading}
      />

      <AddOwnerDialog
        open={ownerDialog}
        onClose={() => setOwnerDialog(false)}
        newOwner={newOwner}
        onChangeNewOwner={(field, value) => setNewOwner({ ...newOwner, [field]: value })}
        roles={roles}
        onAddOwner={handleAddOwner}
        loading={addOwnerLoading}
      />

      <AddTagDialog
        open={tagDialog}
        onClose={() => setTagDialog(false)}
        newTag={newTag}
        onChangeNewTag={(value) => setNewTag(value)}
        onAddTag={handleAddTag}
        loading={addTagLoading}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 3,
          pt: 2,
          borderTop: '1px dashed',
          borderColor: 'divider',
          textAlign: 'right',
        }}
      >
        Last Updated On: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
}
