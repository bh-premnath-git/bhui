import { useState } from 'react';
import { 
  Box, Typography, Button, Stack, Avatar, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Autocomplete
} from '@mui/material';
import { Link as LinkIcon, Plus, X } from 'lucide-react';
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import { red } from '@mui/material/colors';


// Mock API service
const mockApiCall = async (data: any) => {
  // Simulate API delay
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

export default function About(data) {
  const [description, setDescription] = useState('Sample Description about the data source. This needs to be updated by the user.');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Dialog states
  const [linkDialog, setLinkDialog] = useState(false);
  const [ownerDialog, setOwnerDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  
  // Form states
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [newOwner, setNewOwner] = useState({ name: '', role: '', email: '' });
  const [newTag, setNewTag] = useState('');

  // Handle description edit
  const handleDescriptionSave = async () => {
    try {
      await mockApiCall({ description });
      setIsEditingDesc(false);
      toast.success('Description updated successfully', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      toast.error('Failed to update description', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  // Handle link add
  const handleAddLink = async () => {
    try {
      await mockApiCall({ link: newLink });
      setLinks([...links, newLink]);
      setLinkDialog(false);
      setNewLink({ url: '', title: '' });
      toast.success('Link added successfully', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      toast.error('Failed to add link', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  // Handle owner add
  const handleAddOwner = async () => {
    try {
      const owner = {
        id: Math.random().toString(36).substr(2, 9),
        ...newOwner
      };
      await mockApiCall({ owner });
      setOwners([...owners, owner]);
      setOwnerDialog(false);
      setNewOwner({ name: '', role: '', email: '' });
      toast.success('Owner added successfully', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      toast.error('Failed to add owner', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  // Handle tag add
  const handleAddTag = async () => {
    try {
      await mockApiCall({ tag: newTag });
      setTags([...tags, newTag]);
      setTagDialog(false);
      setNewTag('');
      toast.success('Tag added successfully', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      toast.error('Failed to add tag', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };
  return (
    <Box sx={{ 
      p: 2.5,
      height: '100%',
      backgroundColor: 'background.paper',
    }}>
      <Stack spacing={3}>
        {/* About Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              About
            </Typography>
            <Button
              startIcon={<LinkIcon size={14} />}
              variant="outlined"
              size="small"
              onClick={() => setLinkDialog(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
              }}
            >
              Add Link
            </Button>
          </Stack>
          
          {isEditingDesc ? (
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  variant="text"
                  onClick={() => setIsEditingDesc(false)}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}>
                  <CloseIcon sx={{ fontSize: 20, color: 'error.main' }}/>
                </Button>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>
              <Stack direction="row" spacing={1}>
                <Button 
                  size="small" 
                  variant="text"
                  onClick={handleDescriptionSave}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}>
                  <SaveIcon sx={{ fontSize: 20, color: 'black' }}/>
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
                onClick={() => setIsEditingDesc(true)}
                sx={{
                  color: 'primary.main',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                <EditIcon sx={{ fontSize: 16, color: 'black' }} />
              </Button>
            </>
          )}
        </Box>

        {/* Links Section */}
        {links.length > 0 && (
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
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="body2" component="a" href={link.url} target="_blank" sx={{ color: 'black','&:hover': { color: 'primary.main' } }}>
                    {link.title}
                  </Typography>
                  <IconButton size="small" onClick={() => setLinks(links.filter((_, i) => i !== index))}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                          color: 'error.main'
                      }
                    }}>
                    <X size={14} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Owners Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Owners
            </Typography>
            <Button
              startIcon={<Plus size={14} />}
              variant="outlined"
              size="small"
              onClick={() => setOwnerDialog(true)}
              sx={{ textTransform: 'none' }}
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
                    fontSize: '0.875rem'
                  }}
                >
                  {owner.name.split(' ').length > 1
                    ? owner.name.split(' ').map(namePart => namePart.charAt(0).toUpperCase()).join('')
                    : owner.name.charAt(0).toUpperCase() + owner.name.charAt(owner.name.length - 1).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {owner.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {owner.role}
                  </Typography>
                  <Typography variant='caption' color="text.secondary">
                    {owner.email}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Tags Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Tags
            </Typography>
            <Button
              startIcon={<Plus size={14} />}
              variant="outlined"
              size="small"
              onClick={() => setTagDialog(true)}
              sx={{ textTransform: 'none' }}
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
                onDelete={() => setTags(tags.filter((_, i) => i !== index))}
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
      </Stack>

      {/* Add Link Dialog */}
      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            />
            <TextField
              label="URL"
              fullWidth
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLink} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Owner Dialog */}
      <Dialog open={ownerDialog} onClose={() => setOwnerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Owner</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={newOwner.name}
              onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
            />
            <TextField
              label="Role"
              fullWidth
              value={newOwner.role}
              onChange={(e) => setNewOwner({ ...newOwner, role: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={newOwner.email}
              onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOwnerDialog(false)}>Cancel</Button>
          <Button onClick={handleAddOwner} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={tagDialog} onClose={() => setTagDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            label="Tag"
            fullWidth
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTag} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Last Updated Info */}
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          display: 'block',
          mt: 3,
          pt: 2,
          borderTop: '1px dashed',
          borderColor: 'divider'
        }}
      >
        Last Updated On: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
}