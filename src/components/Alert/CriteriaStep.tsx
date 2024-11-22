import { Button, Checkbox, IconButton, Stack, Tab, Tabs, Typography, styled } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
    color: 'black',
    '&.Mui-checked': {
        color: 'green',
    },

}));


export default function CriteriaStep() {
    const [selectedValues2, setSelectedValues2] = useState([]);
    const [tags, setTag]: any = React.useState([]);
    const [checkboxes, setCheckboxes] = useState([
        { id: 1, label: 'Select All', checked: false },
        { id: 2, label: 'Order ID', checked: false },
        { id: 3, label: 'Order Name', checked: false },
        { id: 4, label: 'Order Date', checked: false },

    ]);
    // const [values, setValues] = useState(selectedValues);
    const handleClose = (valueToRemove: string) => {
        setCheckboxes((prevCheckboxes) =>
            prevCheckboxes.map((checkbox) =>
                checkbox.label === valueToRemove ? { ...checkbox, checked: false } : checkbox
            )
        );
    };



    const handleCheckboxChange = (id: number) => {
        setCheckboxes((prevCheckboxes) =>
            prevCheckboxes.map((checkbox) =>
                checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox
            )
        );
    };
    const selectedValues = checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.label);
    const checkboxStyle = {
        width: '20px',
        height: '20px',
        marginRight: '10px',
        marginTop: '30px',
        /* Custom checkbox styles */
        appearance: 'none', /* Remove default appearance */
        backgroundColor: '#ff0000', /* Change background color */
        border: '2px solid #000000', /* Add border */
        borderRadius: '4px', /* Round corners */
        cursor: 'pointer', /* Show pointer cursor on hover */
    };


    return (
        <>
            <Typography sx={{ marginTop: '5%', fontSize: "18px" }}>Please Select the Columns</Typography>
            <Stack direction={'row'} marginTop={'5%'} marginLeft={'21%'} marginBottom={'20s%'}>

                {checkboxes.map((checkbox) => (

                    <label key={checkbox.id} style={{ marginLeft: '5%' }}>
                        <CustomCheckbox

                            checked={checkbox.checked}
                            as={Checkbox}
                            
                            size='medium' 


                            onChange={() => handleCheckboxChange(checkbox.id)}
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}


                        />

                        {checkbox.label}
                    </label>

                ))}

            </Stack>
            <Stack direction={'row'} spacing={4} marginLeft={'24%'}>
                {selectedValues.length > 0 && (
                    <div style={{ marginTop: '10px' }}>

                        {selectedValues.map((value, index) => (

                            <span key={value} style={{ marginLeft: '10px', marginTop: '10px', backgroundColor: 'lightgray', padding: '5px' }} >
                                {value}
                                <IconButton onClick={() => handleClose(value)} >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </span>


                        ))}
                    </div>
                )}
            </Stack>





        </>
    );
}