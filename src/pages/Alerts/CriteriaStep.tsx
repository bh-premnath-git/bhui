import { Button, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';



export default function CriteriaStep() {
    const [selectedValues2, setSelectedValues2] = useState([]);
    const [checkboxes, setCheckboxes] = useState([
        { id: 1, label: 'Select All', checked: false },
        { id: 2, label: 'Order ID', checked: false },
        { id: 3, label: 'Order Name', checked: false },
        { id: 4, label: 'Order Date', checked: false },

    ]);
    // const [values, setValues] = useState(selectedValues);

    // const handleClose = (valueToRemove) => {
    //     console.log('Closing value:', valueToRemove);
    //     const updatedValues = values.filter((value) => value !== valueToRemove);
    //     setValues(updatedValues);
    // };
    
    const handleCheckboxChange = (id) => {
        setCheckboxes((prevCheckboxes) =>
            prevCheckboxes.map((checkbox) =>
                checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox
            )
        );
    };
    const selectedValues = checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.label);


    return (
        <>
        <Typography sx={{marginTop:'5%',fontSize:"18px"}}>Please Select the Columns</Typography>
            <Stack direction={'row'} marginTop={'10px'} marginLeft={'21%'}>

                {checkboxes.map((checkbox) => (
                     
                    <label key={checkbox.id} style={{marginLeft:'5%'}}>
                        <input
                            type="checkbox"
                            checked={checkbox.checked}
                            onChange={() => handleCheckboxChange(checkbox.id)}
                            style={{ width: '20px', height: '20px', marginRight: '10px', marginTop: '30px' }}


                        />

                        {checkbox.label}
                    </label>
                   
                ))}

            </Stack>
            <Stack direction={'row'} spacing={4} marginLeft={'24%'}>
            {selectedValues.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    
                    {selectedValues.map((value) => (
                      
                        <span key={value} style={{ marginLeft: '10px', marginTop: '10px', backgroundColor: 'lightgray',padding: '5px' }}>
                        {value}
                        <IconButton >
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    </span>
                        
                    
                    ))}
                </div>
            )}
            </Stack>





        </>
    );
}