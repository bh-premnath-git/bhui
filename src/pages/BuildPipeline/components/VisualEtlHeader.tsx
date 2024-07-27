import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Button, Stack, Box, Tabs, Tab } from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import * as React from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';
import DnDFlow from "./VisualBody";


type VisualEtlHeaderProps = {
	rightSidebarToggle?: () => void;
};
interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}
/**
 * The VisualEtlHeader component.
 */
function VisualEtlHeader(props: VisualEtlHeaderProps) {

	const { rightSidebarToggle } = props;

	function handleClick() { }
	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<>
			<Stack>
				<Stack direction={'row'} pt={1}  >
					{/* direction={'row'} spacing={2} */}
					<Stack pt={1} >
						<Button
							variant="outlined"
							endIcon={<BorderColorIcon />}
							sx={{
								textTransform: "none",
								color: "black",
								border: "none",
								fontSize: "24px",
								fontWeight: "bold",
								pl: 2,

							}}

						>
							Untitled Job
						</Button>
					</Stack>
					<Box >
						<Box sx={{ borderBottom: 1, borderColor: "divider", ml: 20 }} >
							<Tabs
								value={value}
								onChange={handleChange}
								aria-label="basic tabs example"
							>
								<Tab label="Visual" {...a11yProps(0)} />
								<Tab label="Script" {...a11yProps(1)} />
								<Tab label="Job details" {...a11yProps(2)} />
								<Tab label="Runs" {...a11yProps(3)} />
								<Tab label="Data Quality" {...a11yProps(4)} />
								<Tab label="Schedules" {...a11yProps(5)} />
								<Tab label="Version Control" {...a11yProps(6)} />
							</Tabs>
						</Box>

					</Box>
					<Stack spacing={2} direction={'row'} pl={10} pt={1}>
						<Button variant="contained" endIcon={<KeyboardArrowDownIcon />}
							sx={{ textTransform: 'none', backgroundColor: 'black', color: 'white' }}
						>
							Actions
						</Button>
						<Button variant="contained" sx={{ textTransform: 'none', backgroundColor: 'black', color: 'white' }}>
							Save
						</Button>
					</Stack>
				</Stack>
				<Box >
					<CustomTabPanel value={value} index={0} >
						<DnDFlow />
					</CustomTabPanel>
					<CustomTabPanel value={value} index={1} >
						<Stack sx={{ backgroundColor: 'lightgray' }} px={2} pt={4}>
							<Stack>
								<Typography sx={{color:'green'}}># Prompt: Test</Typography>
							</Stack>
							<Typography sx={{color:'blue'}}>import  <span style={{color:'black'}}>Numpy As Np</span></Typography>
							<Typography sx={{color:'blue'}}>import  <span style={{color:'black'}}>Matplotlip.pyplot As Plt</span></Typography>
							<Typography sx={{color:'green'}}># Create Some Random Data</Typography>
							<Typography>X = Linspace(0 , 2 * Np.Pi, 100)</Typography>
							<Typography>Y = Np.Sin(X)</Typography><br/><br/>
							<Typography sx={{color:'green'}}># Plot The Data</Typography>
							<Typography>Plt.Plot(X , Y)</Typography>
							<Typography>Plt.Show()</Typography>

						</Stack>
					</CustomTabPanel>
					<CustomTabPanel value={value} index={2}>
						Job details
					</CustomTabPanel>
					<CustomTabPanel value={value} index={3}>
						Runs
					</CustomTabPanel>
					<CustomTabPanel value={value} index={4}>
						Data Quality
					</CustomTabPanel>
					<CustomTabPanel value={value} index={5}>
						Schedules
					</CustomTabPanel>
					<CustomTabPanel value={value} index={6}>
						Version Control
					</CustomTabPanel>
				</Box>
			</Stack>
		</>
	);
}

export default VisualEtlHeader;
