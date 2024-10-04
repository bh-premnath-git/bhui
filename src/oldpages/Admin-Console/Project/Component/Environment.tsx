import React, { useState } from 'react';
import { styled, createTheme, ThemeOptions, ThemeProvider } from '@mui/material/styles';
import {
	Button, TextField, Select, MenuItem, InputLabel, FormControl,
	Card, CardContent, Typography, Tabs, Tab, Box, Chip,
	Grid, Paper, AppBar, Toolbar, ButtonProps,
	Checkbox,
} from '@mui/material';
import {
	Info, CloudUpload, Add
} from '@mui/icons-material';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

declare module '@mui/material/styles' {
	interface Palette {
		customTab: Palette['primary'];
	}
	interface PaletteOptions {
		customTab?: PaletteOptions['primary'];
	}
}

// Theme configuration
const createCustomTheme = (selectedTabColor: string) => createTheme({
	palette: {
		primary: {
			main: '#d3d2d2',
		},
		secondary: {
			main: '#dc004e',
		},
		customTab: {
			main: selectedTabColor,
		},
	},
} as ThemeOptions);

// Constants
const tabOrder = ["details", "lake", "zones", "lifecycle"];
const zones = ["Bronze Zone", "Silver Zone", "Gold Zone", "Log Zone", "Quarantine Zone"];
const platforms = [
	{
		name: "Google Cloud",
		imagePath: "/assets/environment/platform/gcp.png"
	},
	{
		name: "Amazon Web Services",
		imagePath: "/assets/environment/platform/aws.png"
	},
	{
		name: "Microsoft Azure",
		imagePath: "/assets/environment/platform/azure.png"
	},
	{
		name: "BigHammer",
		imagePath: "/assets/environment/platform/bighammer.png"
	}
];

// Interfaces
interface EnvironmentConfigProps {
	handleBreadStep: (step: any) => void;
	selectedTabColor?: string;
}

interface CustomButtonProps extends ButtonProps {
	to?: string;
	as?: React.ElementType;
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
	borderRadius: theme.spacing(2),
	boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	padding: theme.spacing(3),
	width: '90%',
	margin: '0 auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderColor: theme.palette.primary.light,
			borderWidth: '2px',
		},
		'&:hover fieldset': {
			borderColor: theme.palette.primary.main,
			borderWidth: '2px',
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.primary.dark,
			borderWidth: '2px',
		},
	},
	'& .MuiOutlinedInput-notchedOutline': {
		boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)',
	},
}));

const StyledSelect = styled(Select)(({ theme }) => ({
	'& .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.light,
	},
	'&:hover .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
	},
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.dark,
	},
}));

const StyledChip = styled(Chip)(({ theme }) => ({
	backgroundColor: theme.palette.primary.light,
	color: theme.palette.primary.contrastText,
	'&:hover': {
		backgroundColor: theme.palette.primary.main,
	},
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	textAlign: 'center',
	cursor: 'pointer',
	transition: 'all 0.3s ease',
	'&:hover': {
		transform: 'translateY(-5px)',
		boxShadow: theme.shadows[4],
	},
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
	'& .MuiTab-root': {
		textTransform: 'none',
		fontWeight: 'normal',
		color: theme.palette.text.primary,
		'&.Mui-selected': {
			backgroundColor: theme.palette.customTab.main,
			color: theme.palette.common.white,
			fontWeight: 'bold',
		},
	},
	'& .MuiTabs-indicator': {
		display: 'none',
	},
}));

const StyledTab = styled(Tab)(({ theme }) => ({
	borderRadius: theme.shape.borderRadius,
	margin: '0 4px',
}));

const StyledButton = styled(Button)<ButtonProps & { component?: React.ElementType; to?: string }>(({ theme }) => ({
	borderRadius: theme.spacing(1),
	textTransform: 'none',
	fontWeight: 'bold',
	padding: theme.spacing(1, 2),
	backgroundColor: 'black',
	color: 'white',
	border: '2px solid black',
	transition: 'all 0.3s ease',
	'&:hover': {
		backgroundColor: 'white',
		color: 'black',
		border: '2px solid black',
	},
	'&:disabled': {
		backgroundColor: '#ccc',
		color: '#666',
		border: '2px solid #ccc',
		cursor: 'not-allowed',
	},
}));

// Helper Components
function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 2 }}>{children}</Box>}
		</div>
	);
}

const CustomStyledButton: React.FC<CustomButtonProps> = ({ to, as, ...props }) => {
	if (to) {
		return <StyledButton component={RouterLink} to={to} {...props} />;
	}
	if (as) {
		return <StyledButton component={as} {...props} />;
	}
	return <StyledButton {...props} />;
};


// Tab Content Components
function DetailsTab({
	selectedPlatform,
	setSelectedPlatform,
	selectedLocation,
	setSelectedLocation,
	selectedEnvironment,
	setSelectedEnvironment,
	tags,
	addTag,
	removeTag
}) {
	return (
		<StyledCard>
			<StyledCardContent>
				<Grid container spacing={2} sx={{ mb: 2 }}>
					<Grid item xs={6}>
						<StyledTextField fullWidth label="Environment Name" variant="outlined" size="small" />
					</Grid>
					<Grid item xs={6}>
						<FormControl fullWidth size="small">
							<InputLabel>Environment</InputLabel>
							<StyledSelect
								label="Environment"
								value={selectedEnvironment}
								onChange={(e) => setSelectedEnvironment(e.target.value)}
							>
								<MenuItem value="dev">Development</MenuItem>
								<MenuItem value="staging">Staging</MenuItem>
								<MenuItem value="prod">Production</MenuItem>
							</StyledSelect>
						</FormControl>
					</Grid>
				</Grid>

				<Typography variant="subtitle1" sx={{ mb: 1 }}>Select Platform</Typography>
				<Grid container spacing={1} sx={{ mb: 2 }}>
					{platforms.map((platform) => (
						<Grid item xs={6} sm={3} key={platform.name}>
						<StyledPaper
						  elevation={selectedPlatform === platform.name ? 3 : 1}
						  sx={{
							border: selectedPlatform === platform.name ? '2px solid' : 'none',
							borderColor: 'primary.main',
							display: 'flex',
							alignItems: 'center',
							padding: 1,
						  }}
						  onClick={() => setSelectedPlatform(platform.name)}
						>
						  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
							<Checkbox
							  checked={selectedPlatform === platform.name}
							  onChange={() => setSelectedPlatform(platform.name)}
							  sx={{ 
								'& .MuiSvgIcon-root': { fontSize: 28 },
								color: 'primary.main',
								'&.Mui-checked': {
								  color: 'primary.main',
								},
								'& .MuiCheckbox-root': {
								  borderRadius: '50%',
								},
								'& .MuiCheckbox-root .MuiSvgIcon-root': {
								  borderRadius: '50%',
								},
							  }}
							/>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1, flexGrow: 1 }}>
							  <Box sx={{ width: 45, height: 45, mb: 1 }}>
								<img
								  src={platform.imagePath}
								  alt={platform.name}
								  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
								/>
							  </Box>
							  <Typography variant="caption">{platform.name}</Typography>
							</Box>
						  </Box>
						</StyledPaper>
					  </Grid>
					))}
				</Grid>

				<Typography variant="subtitle1" sx={{ mb: 1 }}>Credentials</Typography>
				<Grid container spacing={2} sx={{ mb: 2 }}>
					<Grid item xs={6}>
						<StyledTextField fullWidth label="GCP Project ID" variant="outlined" size="small" />
					</Grid>
					<Grid item xs={6}>
						<FormControl fullWidth size="small">
							<InputLabel>Location</InputLabel>
							<StyledSelect
								label="Location"
								value={selectedLocation}
								onChange={(e) => setSelectedLocation(e.target.value)}
							>
								<MenuItem value="us-east">US East</MenuItem>
								<MenuItem value="us-west">US West</MenuItem>
								<MenuItem value="eu-central">EU Central</MenuItem>
							</StyledSelect>
						</FormControl>
					</Grid>
				</Grid>

				<Box sx={{ p: 1, border: '1px dashed', borderColor: 'grey.300', borderRadius: 1, textAlign: 'center', mb: 2 }}>
					<CloudUpload sx={{ fontSize: 24, color: 'grey.500', mb: 1 }} />
					<Typography variant="caption" display="block">
						Drag & Drop your file here or <CustomStyledButton as="span" size="small">Upload</CustomStyledButton>
					</Typography>
				</Box>

				<Typography variant="subtitle1" sx={{ mb: 1 }}>Add Tags</Typography>
				<Typography variant="caption" display="block" sx={{ mb: 1 }}>
					Add tags to identify compute instances (Eg: Key: Product, Value: Bighammer.ai)
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
					{tags.map((tag, index) => (
						<StyledChip
							key={index}
							label={tag}
							onDelete={() => removeTag(tag)}
							size="small"
						/>
					))}
				</Box>
				<CustomStyledButton startIcon={<Add />} onClick={addTag} size="small">
					ADD TAG
				</CustomStyledButton>
			</StyledCardContent>
		</StyledCard>
	);
}

function LakeTab() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Grid container spacing={2} sx={{ mb: 2 }}>
					<Grid item xs={6}>
						<StyledTextField
							fullWidth
							label="Business URL"
							variant="outlined"
							size="small"
							InputProps={{
								endAdornment: <Info fontSize="small" color="action" />,
							}}
						/>
					</Grid>
					<Grid item xs={6}>
						<StyledTextField
							fullWidth
							label="Lake Name"
							variant="outlined"
							size="small"
							InputProps={{
								endAdornment: <Info fontSize="small" color="action" />,
							}}
						/>
					</Grid>
				</Grid>
				<StyledTextField
					fullWidth
					label="Lake Description"
					variant="outlined"
					size="small"
					multiline
					rows={3}
					sx={{ mt: 2 }}
				/>
			</StyledCardContent>
		</StyledCard>
	);
}

function ZonesTab() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
					Based on the business URL and lake name, all zones are preconfigured. Please find the zone details below. To know more about data zone{' '}
					<CustomStyledButton color="primary" size="small">Click Here</CustomStyledButton>.
				</Typography>
				{zones.map((zone, index) => (
					<Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
						<Typography variant="body2" sx={{ width: 180, mr: 1, textAlign: 'right' }}>
							{zone} <Info fontSize="small" color="action" />
						</Typography>
						<StyledTextField
							fullWidth
							value="S3://Mylake.R.Vyz12.Abc.Com"
							InputProps={{
								readOnly: true,
							}}
							variant="outlined"
							size="small"
						/>
					</Box>
				))}
			</StyledCardContent>
		</StyledCard>
	);
}

function LifecycleTab({ standardZoneDays, archiveZoneDays, handleDaysChange }) {
	return (
		<StyledCard>
			<StyledCardContent>
				<Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
					Configure duration for which data needs to be stored. Please note life cycle policy is done as per the organization governance standards. To know more about life cycle policy{' '}
					<CustomStyledButton color="primary" size="small">Click Here</CustomStyledButton>.
				</Typography>

				<Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Days In Standard Zone</Typography>
				<Grid container spacing={1}>
					{zones.map((zone) => (
						<Grid item xs={12} sm={6} md={2.4} key={`standard-${zone}`}>
							<StyledTextField
								fullWidth
								label={zone}
								type="number"
								value={standardZoneDays[zone] || ''}
								onChange={(e) => handleDaysChange(zone, e.target.value, true)}
								InputProps={{
									endAdornment: <Info fontSize="small" color="action" />,
								}}
								size="small"
							/>
						</Grid>
					))}
				</Grid>

				<Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Days In Archive Zone</Typography>
				<Grid container spacing={1}>
					{zones.map((zone) => (
						<Grid item xs={12} sm={6} md={2.4} key={`archive-${zone}`}>
							<StyledTextField
								fullWidth
								label={zone}
								type="number"
								value={archiveZoneDays[zone] || ''}
								onChange={(e) => handleDaysChange(zone, e.target.value, false)}
								InputProps={{
									endAdornment: <Info fontSize="small" color="action" />,
								}}
								size="small"
							/>
						</Grid>
					))}
				</Grid>
			</StyledCardContent>
		</StyledCard>
	);
}

export default function EnvironmentConfig({ handleBreadStep, selectedTabColor = '#090909' }: EnvironmentConfigProps) {
	const theme = createCustomTheme(selectedTabColor);

	const [activeTab, setActiveTab] = useState(0);
	const [selectedPlatform, setSelectedPlatform] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('');
	const [selectedEnvironment, setSelectedEnvironment] = useState('');
	const [tags, setTags] = useState(["Department >> Tech", "Region >> USA"]);
	const [standardZoneDays, setStandardZoneDays] = useState({});
	const [archiveZoneDays, setArchiveZoneDays] = useState({});

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const navigateTab = (direction) => {
		if (direction === 'next' && activeTab < tabOrder.length - 1) {
			setActiveTab(activeTab + 1);
		} else if (direction === 'back' && activeTab > 0) {
			setActiveTab(activeTab - 1);
		}
	};

	const addTag = () => {
		const newTag = `Tag ${tags.length + 1}`;
		setTags([...tags, newTag]);
	};

	const removeTag = (tagToRemove) => {
		setTags(tags.filter(tag => tag !== tagToRemove));
	};

	const handleDaysChange = (zone, value, isStandard) => {
		if (isStandard) {
			setStandardZoneDays(prev => ({ ...prev, [zone]: value }));
		} else {
			setArchiveZoneDays(prev => ({ ...prev, [zone]: value }));
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ width: '90%', maxWidth: '1100px', margin: 'auto', typography: 'body1' }}>
				<AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'transparent' }}>
					<Toolbar variant="dense">
						<StyledTabs
							value={activeTab}
							onChange={handleTabChange}
							aria-label="environment config tabs"
							sx={{ flexGrow: 1 }}
						>
							<StyledTab label="Environment Details" />
							<StyledTab label="Configure Lake" />
							<StyledTab label="Preconfigure Zones" />
							<StyledTab label="Configure Lifecycle Policy" />
						</StyledTabs>
						<CustomStyledButton variant="contained" color="primary" size="small" to="/All Environment">
							View All Environments
						</CustomStyledButton>
					</Toolbar>
				</AppBar>

				<TabPanel value={activeTab} index={0}>
					<DetailsTab
						selectedPlatform={selectedPlatform}
						setSelectedPlatform={setSelectedPlatform}
						selectedLocation={selectedLocation}
						setSelectedLocation={setSelectedLocation}
						selectedEnvironment={selectedEnvironment}
						setSelectedEnvironment={setSelectedEnvironment}
						tags={tags}
						addTag={addTag}
						removeTag={removeTag}
					/>
				</TabPanel>

				<TabPanel value={activeTab} index={1}>
					<LakeTab />
				</TabPanel>

				<TabPanel value={activeTab} index={2}>
					<ZonesTab />
				</TabPanel>

				<TabPanel value={activeTab} index={3}>
					<LifecycleTab
						standardZoneDays={standardZoneDays}
						archiveZoneDays={archiveZoneDays}
						handleDaysChange={handleDaysChange}
					/>
				</TabPanel>

				<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
					<CustomStyledButton
						variant="outlined"
						onClick={() => navigateTab('back')}
						disabled={activeTab === 0}
						sx={{ mr: 1 }}
						size="small"
					>
						Back
					</CustomStyledButton>
					<CustomStyledButton
						variant="contained"
						onClick={() => navigateTab('next')}
						disabled={activeTab === tabOrder.length - 1}
						size="small"
					>
						Next
					</CustomStyledButton>
				</Box>
			</Box>
		</ThemeProvider>
	);
}
