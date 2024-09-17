
import Button from '@mui/material/Button';
import { Box, Grid, Typography } from '@mui/material';
import { memo } from 'react';
import { Link } from 'react-router-dom';

function LandingContent() {
return (

		<>
			<Box sx={{ flexGrow: 1, margin: '2%' }}>
				<Grid container spacing={2}>
					<Grid item xs={1}>

					</Grid>
					<Grid item xs={5}>
						<div className="flex flex-col mx-auto w-full p-32 pr-0">
							<img className=" shadow" style={{ height: '34vh' }} src="/assets/landing/landing-img.png" /></div>
					</Grid>
					<Grid item xs={5}>
						<Box className="bg-light p-4" style={{ marginLeft: "-25px", height: '40vh', marginTop: '-25px', borderRadius: '8px' }}>
							<Typography variant='h6' className='mmf fs-2' sx={{ fontWeight: 'bold' }}>
								Setup a Project
							</Typography>
							<Typography
								color="inherit" style={{ width: '400px', height: '200px' }}
								className="fs-3 mmf sm:mt-24 opacity-75 tracking-tight max-w-md"
							> Click here to start the project.
							</Typography>
								<div>
									<Button
										sx={{
											backgroundColor: '#000',
											padding: '12px 24px',  // Fixed padding
											fontSize: '1rem',      // Fixed font size
											color: 'white',
											position: 'absolute',     // Fixed position relative to the viewport
											bottom: '50%',         // Center vertically
											transform: 'translateY(50%)', // Center vertically
											margin: 0,
											textTransform:'none'           // Remove margin
										}}
										component={Link}
										variant="contained"
										className="sign-in-button bg-dark text-white mmf fs-3"
										aria-label="Sign in"
										to={`/Admin-Console/Environment/New`}
									>
										Setup a Project
									</Button>
								</div>
								{/* <Button component={Link}
										variant="contained"
										className="sign-in-button bg-dark text-white"
										aria-label="Sign in"
										to={`/Admin-Console/Environment/New`}
									>Setup a Project

								</Button> */}

						</Box>
					</Grid>
					<Grid item xs={1}>

					</Grid>
				</Grid>
			</Box>

		</>

	);
}

export default memo(LandingContent);
