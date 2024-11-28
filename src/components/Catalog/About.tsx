import { Box, Typography, Button, Stack, Avatar, Chip } from '@mui/material';
import { Link as LinkIcon, Plus } from 'lucide-react';

export default function About({ data }: any) {
  return (
    <Box sx={{ 
      p: 2.5,
      height: '100%',
      backgroundColor: 'background.paper',
    }}>
      {/* About Section */}
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              About
            </Typography>
            <Button
              startIcon={<LinkIcon size={14} />}
              variant="text"
              size="small"
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              Add Link
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Lorem ipsum is simply Dummy Test of The Printing and Typecasting Industry.Lorem Ipsum Text Typecasting Industry.
          </Typography>
          <Button
            size="small"
            variant="text"
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
            Edit
          </Button>
        </Box>

        {/* Owners Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Owners
            </Typography>
            <Button
              startIcon={<Plus size={14} />}
              variant="text"
              size="small"
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              Add Owners
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              JD
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Data Owner
              </Typography>
            </Box>
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
              variant="text"
              size="small"
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              Add Tags
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label="Database" 
              size="small"
              sx={{ 
                borderRadius: '4px',
                backgroundColor: 'primary.lighter',
                color: 'primary.main',
                height: '24px',
                fontSize: '0.75rem'
              }} 
            />
            <Chip 
              label="Employee" 
              size="small"
              sx={{ 
                borderRadius: '4px',
                backgroundColor: 'success.lighter',
                color: 'success.main',
                height: '24px',
                fontSize: '0.75rem'
              }} 
            />
            <Chip 
              label="HR" 
              size="small"
              sx={{ 
                borderRadius: '4px',
                backgroundColor: 'warning.lighter',
                color: 'warning.main',
                height: '24px',
                fontSize: '0.75rem'
              }} 
            />
          </Stack>
        </Box>
      </Stack>

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
        Last Updated On: 17/11/2024 10:58 AM
      </Typography>
    </Box>
  );
}