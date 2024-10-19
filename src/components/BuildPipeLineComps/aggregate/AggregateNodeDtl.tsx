import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Stack,
    Tab,
    Tabs
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { CustomTabPanel } from "@/pages/dataCatalog/catalogSchema";
import form_data from "@/pages/buildPipeLine/join_form_data.json";
import { useDispatch, useSelector } from "react-redux";
import { getJoinType } from "@/redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { AggForm } from "./AggForm";
import { GroupByForm } from "./GroupByForm";
import { PivotForm } from "./PivotForm";


export default function AggregateNodeDtl({ isOpen, onClose, handleDelete }: any) {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const { joinList, selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    console.log(selectedOption)
    // State to store form data for each tab
    const [formStates, setFormStates] = useState(
        form_data.module.map((data) => ({
            conditions: [{ [data.fields[0].name]: '', [data.fields[1].name]: '' }]
        })) // Initialize form states with empty values
    );

    const handleChange = (event: any, newValue: any) => {
        setValue(newValue);
    };

    function capitalizeFLetter(string: string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    // Update form state when a form is submitted or changed
    const updateFormState = (index: any, newFormData: any) => {
        setFormStates((prev) => {
            const updatedFormStates = [...prev];
            updatedFormStates[index] = newFormData;
            return updatedFormStates;
        });
    };

    useEffect(() => {
        dispatch(getJoinType({ value: 14 }));
    }, [dispatch]);

    useEffect(() => {
        console.log(joinList);
        console.log(formStates);
    }, [joinList, selectedOption]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={'xl'}
           
        >
            <DialogTitle>
                <h5>{selectedOption?.display}</h5>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "black" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{width:'80vh'}}>
                <Stack direction="row">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        centered
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: "#000",
                                height: 5,
                                width: "30px",
                                marginLeft: "calc((100% / 4) / 2)",
                                borderRadius: "10px 10px 0 0"
                            }
                        }}
                        sx={{
                            "& .MuiTab-root": {
                                textTransform: "none",
                                color: "black",
                                "&.Mui-selected": { fontWeight: "bold" }
                            }
                        }}
                    >
                        {/* {form_data.module.map((item, index) => (
                            <Tab label={capitalizeFLetter(item.name)} key={index} />
                        ))} */}
                        <Tab label={'Aggrigate'} key={0} />
                        <Tab label={'Group By'} key={1} />
                        <Tab label={'Pivot'} key={2} />

                    </Tabs>
                </Stack>

                    <CustomTabPanel value={value} index={0} >
                        <AggForm />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1} >
                        <GroupByForm />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2} >
                        <PivotForm />
                    </CustomTabPanel>
            </DialogContent>
        </Dialog>
    );
}
