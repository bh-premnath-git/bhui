import {  Stack} from '@mui/material/';
import _ from 'lodash';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

/**
 * The ProjectDashboardAppHeader page.
 */
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const projectsName = [
    { title: 'All Environment', },
    { title: 'Project Name 1', },
    { title: 'Project Name 2', },
    { title: 'Project Name 3', },
    { title: 'Project Name 4', },


];
const days = [
    { title: 'Today', },
    { title: 'Yesterday', },

];

function DashboardHeader() {


    return (
        <div >
            <Stack direction={'row'} spacing={2} my={3}>
                <Autocomplete
                sx={{
                    m: 1,
                    width: '35ch',
                    '& fieldset': {
                        borderColor: '#f2f3f5', // Change border color to light grey
                    },
                    '&:hover fieldset': {
                        borderColor: '#f2f3f5', // Add hover effect
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#f2f3f5', // Add focus effect
                    }
                }}
                    multiple
                    id="checkboxes-tags-demo"
                    options={projectsName}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.title}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option.title}
                        </li>
                    )}
                    style={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Filter By Project Name" />
                        // label="Checkboxes"
                    )}
                />
                <Autocomplete
                sx={{
						m: 1,
						width: '35ch',
						'& fieldset': {
							borderColor: '#f2f3f5', // Change border color to light grey
						},
						'&:hover fieldset': {
							borderColor: '#f2f3f5', // Add hover effect
						},
						'&.Mui-focused fieldset': {
							borderColor: '#f2f3f5', // Add focus effect
						}
					}}
                    // multiple
                    id="checkboxes-tags-demo"
                    options={days}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.title}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option.title}
                        </li>
                    )}
                    style={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Choose a Day" />
                        // label="Checkboxes"
                    )}
                />
            </Stack>
        </div>
    );
}

export default DashboardHeader;
