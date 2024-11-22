import { Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography } from "@mui/material";
import { Field } from "formik";
import { useState } from "react";

export default function AlertChannelStep() {
    const [selectedValues, setSelectedValues] = useState([]);
    const [checked, setChecked] = useState(false);
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);




    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };
    const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked1(event.target.checked);
    };
    const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked2(event.target.checked);
    };
    const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked3(event.target.checked);
    };


    // const [checkboxes, setCheckboxes] = useState([
    //     { id: 1, label: 'Publish To Service Now', checked: false },
    //     { id: 2, label: 'Publish Email', checked: false },
    //     { id: 3, label: 'Publish To Slack', checked: false },
    //     { id: 4, label: 'Publish To Teams', checked: false },

    // ]);

    // const handleCheckboxChange = (id) => {
    //     setCheckboxes((prevCheckboxes) =>
    //         prevCheckboxes.map((checkbox) =>
    //             checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox
    //         )
    //     );
    // };


    return (
        <>
            <Stack spacing={2}>
                <Typography sx={{ textAlign: 'left' }}>
                    Add Alert Channels
                </Typography>
                 <Stack direction={'row'} spacing={3} justifyContent={'space-between'}>
                    <Stack direction={'row'} spacing={4}>
                        <Stack >
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox checked={checked} onChange={handleChange} style={{color:'grey'}} />}
                                    label="Publish To Service Now"
                                />
                            </FormGroup>
                            <Typography textAlign={"left"} sx={{ marginBottom: '10px' }}> Add URL <span style={{ color: 'red' }}>*</span></Typography>
                            <TextField id="outlined-basic" variant="outlined" placeholder="Add URL" />
                        </Stack>
                        <Stack>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox checked={checked1} onChange={handleChange1} style={{color:'grey'}} />}
                                    label="Publish Email"
                                />
                            </FormGroup>
                            <Typography textAlign={"left"} sx={{ marginBottom: '10px' }} >Email ID<span style={{ color: 'red' }}>*</span></Typography>
                            <TextField id="outlined-basic" variant="outlined" placeholder="Enter Email ID" />
                        </Stack>
                        <Stack>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox checked={checked2} onChange={handleChange2} style={{color:'grey'}} />}
                                    label="Publish To Slack"
                                />
                            </FormGroup>
                            <Typography textAlign={"left"} sx={{ marginBottom: '10px' }} >Add URL<span style={{ color: 'red' }}>*</span></Typography>
                            <TextField id="outlined-basic" variant="outlined" placeholder="Enter Slack URL" />
                        </Stack>
                        <Stack >
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox checked={checked3} onChange={handleChange3} style={{color:'grey'}} />}
                                    label="Publish To Teams"
                                />
                            </FormGroup>
                            <Typography textAlign={"left"} sx={{ marginBottom: '10px' }}> Add URL <span style={{ color: 'red' }}>*</span></Typography>
                            <TextField id="outlined-basic" variant="outlined" placeholder="Add Teams URL" />
                        </Stack>

                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}