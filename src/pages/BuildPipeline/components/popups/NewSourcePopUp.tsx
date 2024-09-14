import {
    Box,
    Button,
    Container,
    Grid,
    Stack,
    Typography,
    Modal,
    TextField,
    InputAdornment,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useEffect, useState } from "react";
import { IoSearchCircleOutline } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa";
import { MdKeyboardArrowUp } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getConfig } from "../../../../redux/BuildPipeLineSlice";
import { RootState } from "../../../../redux/store";

export default function NewSourcePopUp({ isOpen, onClose }) {
    const [isShowAll, setIsShowAll] = useState(false);
    const { dataConfig } = useSelector((state: RootState) => state.buildPipeLineApi)
    const dispatch = useDispatch();

    const handleClose = () => {
        onClose();
    };
    function handleDrop() {
        setIsShowAll(!isShowAll);
    }
    useEffect(() => {
        dispatch(getConfig());
        console.log(dataConfig)
    }, [dispatch]);

    return (
        <>
            <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}

            >
                <>
                    <Container
                        sx={{
                            backgroundColor: "white",
                            padding: 3,
                            borderRadius: 1,
                            boxShadow: 24,
                            outline: "none",
                            width: '45%'
                        }}
                    >
                        <Stack sx={{
                            width: '100%',
                            // maxWidth: 400, // Adjusted width of the modal
                            minHeight: 500,
                        }}>
                            <Stack direction={"row"} justifyContent={"space-between"} color={"black"}>
                                <Stack width={"100%"}>
                                    <Typography className="myHeadFont" fontWeight={"bold"}>
                                        Configure A New Source
                                    </Typography>
                                    <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}>
                                        <Typography className="mff text-secondary">
                                            Please select a source from the options below
                                        </Typography>
                                        <TextField
                                            className="my-1"
                                            id="left-search"
                                            size="small"
                                            placeholder="Search By keywords"
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IoSearchCircleOutline />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                                <Stack>
                                    <ClearIcon onClick={handleClose} style={{ cursor: "pointer" }} />
                                </Stack>
                            </Stack>
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {Array.from({ length: 24 }).slice(0, !isShowAll ? 4 : 24).map((item, index) => (
                                    <Grid item xs={3} key={index}>
                                        <Stack
                                            className="border rounded p-2"
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center" // This centers the items vertically
                                        >
                                            <img src="/assets/config/con.png" width={50} alt="" />
                                            <Typography className="myHeadFont" fontWeight="bold">
                                                Snow
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                            <Stack onClick={handleDrop} className="text-center text-info myHeadFont my-2" sx={{ textDecoration: 'underline' }}>
                                <div className="d-flex justify-content-center">
                                    See 30 More Sources <span>{isShowAll ? <FaAngleDown /> : <MdKeyboardArrowUp />}</span>

                                </div>
                            </Stack>
                        </Stack>

                        {/* Footer with buttons */}
                        <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
                            <Button variant="outlined" className="mx-2 px-2" sx={{
                                color: 'black', textTransform: 'none', borderColor: 'black'
                            }} onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button className="mx-2 px-2" variant="contained" sx={{ background: 'black', textTransform: 'none' }}>
                                Save
                            </Button>
                        </Stack>
                    </Container>
                </>
            </Modal>
        </>
    );
}
