import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React, { useState } from "react";
import { SelectChangeEvent } from "@mui/material";

export default function SourceStep() {
    const [showPage, setShowPage] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedValue, setSelectedValue] = useState<string[]>([]);
    const [age, setAge] = React.useState('');
    const open = Boolean(anchorEl);
    const handleChange = (event: SelectChangeEvent<string[]>) => {
        setSelectedValue(event.target.value as string[]);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const [checkboxes, setCheckboxes] = useState([
        { id: 1, label: 'Select All', checked: false },
        { id: 2, label: 'Order ID', checked: false },
        { id: 3, label: 'Order Name', checked: false },
        { id: 3, label: 'Order Date', checked: false },

    ]);

    const handleCheckboxChange = (id: number) => {
        setCheckboxes((prevCheckboxes) =>
            prevCheckboxes.map((checkbox) =>
                checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox
            )
        );
    };


    return (
        <>
            <Stack spacing={3} sx={{ marginTop: '7%' }}>
                <Typography sx={{ color: 'gray', fontSize: '20px' }} >Select the data source that needs to be monitered. Source will be monitored based on <br />the schedule and any alerts will be published</Typography>
                <Typography style={{ display: 'flex', justifyContent: 'center',margin:'center',textAlign:'center',marginRight:'23%'}}>Data Source</Typography>
                <div style={{ display: 'flex', justifyContent: 'center' }}>

                <FormControl sx={{width:'30%',margin:'center',textAlign:'center'}}>
                    
                    <Select
                        labelId="select-label"
                        id="select"
                        value={selectedValue}
                        onChange={handleChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="option1">Option 1</MenuItem>
                        <MenuItem value="option2">Option 2</MenuItem>
                        <MenuItem value="option3">Option 3</MenuItem>
                    </Select>
                </FormControl>
                </div>
                {showPage &&
                    <Stack>
                        {checkboxes.map((checkbox) => (
                            <label key={checkbox.id}>
                                <input
                                    type="checkbox"
                                    checked={checkbox.checked}
                                    onChange={() => handleCheckboxChange(checkbox.id)}
                                />
                                {checkbox.label}
                            </label>
                        ))}
                        <div style={{ marginTop: '10px' }}>
                            {selectedValue.map((value) => (
                                <div
                                    key={value}
                                    style={{
                                        display: 'inline-block',
                                        padding: '5px 10px',
                                        backgroundColor: 'lightblue',
                                        borderRadius: '5px',
                                        marginRight: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {value}
                                </div>
                            ))}
                        </div>


                    </Stack>



                }

            </Stack >

        </>
    );
}