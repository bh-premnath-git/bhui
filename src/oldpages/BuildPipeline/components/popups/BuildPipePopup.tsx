import { Tooltip, IconButton, Stack, TextField, InputAdornment, Box, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineArrowsAlt } from "react-icons/ai";
import { color } from 'framer-motion';
function BuildPipePopup({ closePopup }: { closePopup: () => void }) {    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showButtons, setShowButtons] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(true);
    const navigate = useNavigate();
    const handleTextFieldFocus = () => {
        setInputValue('Please join customers and order datasets then filter them and retrieve the top 10 based on total orders');
        setIsFocused(false);
    };
    const handleTextFieldBlur = () => {
        setIsFocused(false);
    };
  
    const handleSendClick = () => {
        const newSuggestion = `Suggestion `;
        setSuggestions([...suggestions, newSuggestion]);
        setShowButtons(true);
    };
    const handleRefineClick = () => {
        setShowButtons(false);
    };
    if (!isPopupVisible) return null;
    return (
        <div style={{ padding: "20px" }}>
            <Stack direction={'row'} justifyContent={'right'}>
                <IconButton
                    sx={{
                        backgroundColor: 'black',
                        width: '40px',
                        height: '40px',
                        borderRadius: '0',
                        '&:hover': {
                            backgroundColor: 'black',
                        },
                    }}
                >
                    <AiOutlineArrowsAlt style={{ color: 'white' }} />
                </IconButton>
                <IconButton onClick={closePopup} >
                    <CloseIcon />
                </IconButton>
            </Stack>
            <Stack direction={'row'} spacing={2} sx={{ my: 2 }} alignContent={'center'} alignItems={'center'}>
                <Tooltip title="" placement="top">
                    <IconButton
                        style={{
                            margin: "10px",
                            border: '1px solid gray',
                            borderRadius: '50%',
                            backgroundColor: 'blue',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <img src="/assets/buildPipeline/bighammer.png" alt="bighammer" width={50} />
                    </IconButton>
                </Tooltip>
                <Stack direction={'row'} sx={{ mt: 2 }} >
                    <img src="/assets/whiteTry.png" alt="triangle" width={15} height={10} />

                    <Box position="relative" width="100%">
                        <TextField
                            placeholder={isFocused ? '' : "Ask me anything"}
                            value={inputValue}
                            onFocus={handleTextFieldFocus}
                            onBlur={handleTextFieldBlur}
                            onChange={(e) => setInputValue(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: !isFocused && (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                backgroundColor: 'white',
                                color: 'black',
                                '& .MuiInputBase-input': {
                                    color: 'black',
                                },
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '5px',
                                display: 'flex',

                            }}
                        >
                            <AiOutlineArrowsAlt style={{ fontSize: 18, color: 'black' }} />
                        </Box>
                    </Box>
                </Stack>
            </Stack>

            <IconButton
                sx={{
                    float: 'right',
                    backgroundColor: 'black',
                    width: '40px',
                    height: '40px',
                    borderRadius: '0',
                    '&:hover': {
                        backgroundColor: 'black',
                    },
                }}
                onClick={handleSendClick}
            >
                <SendIcon sx={{ color: 'white' }} />
            </IconButton>
            {suggestions.map((suggestion, index) => (
                <div key={index} style={{ marginTop: "50px" }}>
                    <Typography >{suggestion}</Typography>
                    <Stack direction={'row'}></Stack>


                    <Box mt={4} ml={5}>
                        <Stack direction={'row'}>
                            <img src="/assets/Triangle.png" alt="triangle" width={10} height={10} />
                            <Box position="relative" width="100%">
                                <TextField
                                    placeholder="Please join customers and order datasets then filter them and retrieve the top 10 based on total order"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    sx={{
                                        // backgroundColor: '#000',
                                        background: 'linear-gradient(#ffdee2, #ffebed)',
                                        color: 'black',
                                        '& .MuiInputBase-input': {
                                            color: 'black',
                                        },
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        display: 'flex',

                                    }}
                                >
                                    <AiOutlineArrowsAlt style={{ fontSize: 24, color: 'black' }} />
                                </Box>
                            </Box>
                        </Stack>
                        {showButtons ? (
                            <Stack direction="row" spacing={2} justifyContent="right" mt={2}>
                                <Button variant="contained" sx={{ bgcolor: "white", color: "black" }} onClick={handleRefineClick}>
                                    Refine
                                </Button>
                                <Button variant="contained" sx={{ bgcolor: "black" }}>
                                    Generate
                                </Button>
                            </Stack>
                        ) : (
                            <IconButton
                                sx={{
                                    marginTop: "10px",
                                    float: 'right',
                                    backgroundColor: 'black',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '0',
                                    '&:hover': {
                                        backgroundColor: 'black',
                                    },
                                }}
                                onClick={handleSendClick}
                            >
                                <SendIcon sx={{ color: 'white' }} />
                            </IconButton>
                        )}
                    </Box>
                </div>
            ))}
        </div>
    );
}
export default BuildPipePopup;