import { Divider, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel, FormGroup, } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from "react";

export default function FiltersDtl() {
    const options = ['1', '2', '3+'];

    const filterList = [
        { 'id': 1, "name": 'Degree of dependencies' },
        { 'id': 2, "name": 'Type' },
        { 'id': 3, "name": 'Platform' },
        { 'id': 4, "name": 'Tag' },
        { 'id': 5, "name": 'Owned By' },
        { 'id': 6, "name": 'Sub Type' },
        { 'id': 7, "name": 'Environment' },

    ]
    const [selectedOptions, setSelectedOptions]: any = useState([]);

    // Function to handle checkbox change
    const handleCheckboxChange = (option: any) => (event: any) => {
        if (event.target.checked) {
            // If checkbox is checked, add the option to selectedOptions
            setSelectedOptions([...selectedOptions, option]);
        } else {
            // If checkbox is unchecked, remove the option from selectedOptions
            setSelectedOptions(selectedOptions.filter((item: any) => item !== option));
        }
    };
    return (
        <>
            <Stack sx={{ mt: '4px' }}>
                <Typography variant='body2' sx={{ p: '4px' }}>Filters </Typography>
                <Divider />
                <Stack>
                    {filterList.map(data => (
                        <Accordion key={data?.id} sx={{ m: '8px', border: '1px solid lightgrey' }} elevation={0}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel-content"
                                id="panel-header"
                            >
                                <Typography>{data?.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    <FormGroup>
                                        {options.map((option: any) => (
                                            <FormControlLabel
                                                key={option.id}
                                                control={
                                                    <Checkbox style={{ color: 'green' }}
                                                        checked={selectedOptions.includes(option)}
                                                        onChange={handleCheckboxChange(option)}
                                                    />
                                                }
                                                label={option}
                                            />
                                        ))}
                                    </FormGroup>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            </Stack>
        </>
    )
}