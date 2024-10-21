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
import { useDispatch, useSelector } from "react-redux";
import { getJoinType } from "@/redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { AggForm } from "./AggForm";
import { GroupByForm } from "./GroupByForm";
import { PivotForm } from "./PivotForm";


export default function AggregateNodeDtl({ isOpen, onClose, handleDelete }: any) {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const { selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    const handleChange = (event: any, newValue: any) => {
        setValue(newValue);
    };

   

   
    useEffect(() => {
        dispatch(getJoinType({ value: 14 }));
    }, [dispatch]);

   
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={'xl'}
           
        >
            <DialogTitle>
                <h5>{selectedOption?.display??selectedOption?.label}</h5>
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
                        <Tab label={'Aggregate'} key={0} />
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
