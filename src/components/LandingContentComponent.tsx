import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';

function LandingContent() {
  return (
    <Grid container spacing={2}>
      <Grid xs={1} />
      <Grid xs={5}>
        <div className="flex flex-col mx-auto w-full p-32 pr-0">
          <img 
            className="shadow" 
            style={{ height: '34vh' }} 
            src="/assets/landing/landing-img.png" 
            alt="Landing"
          />
        </div>
      </Grid>
      <Grid xs={5}>
        <Box 
          className="bg-light p-4" 
          sx={{ 
            marginLeft: "-25px", 
            height: '40vh', 
            marginTop: '-25px', 
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          <Typography variant='h6' className='mmf fs-2' sx={{ fontWeight: 'bold' }}>
            Setup a Project
          </Typography>
          <Typography
            color="inherit" 
            sx={{ width: '400px', height: '200px' }}
            className="fs-3 mmf sm:mt-24 opacity-75 tracking-tight max-w-md"
          >
            Click here to start the project.
          </Typography>
          <Button
            sx={{
              backgroundColor: '#000',
              padding: '12px 24px',
              fontSize: '1rem',
              color: 'white',
              position: 'absolute',
              bottom: '16px',
              textTransform: 'none'
            }}
            component={Link}
            variant="contained"
            className="sign-in-button bg-dark text-white mmf fs-3"
            aria-label="Sign in"
            to="/Admin-Console/Environment/New"
          >
            Setup a Project
          </Button>
        </Box>
      </Grid>
      <Grid xs={1} />
    </Grid>
  );
}

export default LandingContent;