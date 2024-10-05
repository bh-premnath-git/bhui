import { InputAdornment, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import NewSourcePopUp from '../oldpages/BuildPipeline/components/popups/NewSourcePopUp';
import { useDispatch, useSelector } from 'react-redux';
import { getSource } from '../redux/BuildPipeLineSlice';
import { RootState } from '../redux/store';

const ExpandableButton = ({ icon: Icon, text, className, style, title, addNode, dataSet }) => {
    const [showText, setShowText] = useState(false);
    const [selected, setSelected] = React.useState(false);
    const dispatch = useDispatch();
    const { dataSource } = useSelector((state: RootState) => state.buildPipeLineApi);
    const handleClick = () => {
        setShowText(!showText);
    };
    const handleOpenClick = () => {
        setShowText(false);
        setShowText(true)
    };
    const closePopup = () => {
        setSelected(false);
    }
    const openPopUp = () => {
        setSelected(true);
    }

    const [searchValue, setSearchValue] = useState('');
    const searchProject = (event: any) => {
        const { value } = event.target;
        setSearchValue(value);
        debouncedSearchProject(value);
    };

    const debouncedSearchProject = debounce((value) => {
        // props.search(value);
    }, 1000);
    function handleNode(lead, title, index) {
        addNode(lead, title, index);
        handleClick();
    }
    useEffect(() => {
        if (text == 'Source') {
            dispatch(getSource({ offset: 0, limit: 10, order_desc: false }));
        }

    }, [dispatch, dataSource.length > 0])

    const imgList = [
        { id: 1, img: '/assets/buildPipeline/7.png', line: '/assets/buildPipeline/Line 1.png' },
        { id: 2, img: '/assets/buildPipeline/bigquery.png', line: '/assets/buildPipeline/Line 5.png' },
        { id: 3, img: '/assets/buildPipeline/file.png', line: '/assets/buildPipeline/Line 5.png' },
        { id: 4, img: '/assets/buildPipeline/gcs.png', line: '/assets/buildPipeline/Line 5.png' },
        { id: 5, img: '/assets/buildPipeline/snowflake.png', line: '/assets/buildPipeline/Line 5.png' },
        { id: 6, img: '/assets/buildPipeline/xl.png', line: '/assets/buildPipeline/Line 1.png' }
    ];
    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * imgList.length);
        return imgList[randomIndex];
    };
    const randomImage = getRandomImage();

    return (
        <>
            <div style={{ marginBottom: '10px' }}>
                <button
                    onClick={handleOpenClick}
                    className={className}
                    style={{ display: 'flex', alignItems: 'center', padding: '10px', fontSize: '16px', ...style }}
                >
                    {Icon}
                    {(showText && text != '') && (<span className='mx-2'>{text}</span>)}
                </button>
                {showText && (
                    <div className='rounded w-25 shadow-sm'
                        style={{
                            marginTop: '10px',
                            padding: '10px',
                            border: '1px solid #f2f2f2',
                            backgroundColor: '#fff',
                            position: 'absolute',
                            zIndex: 1000
                        }}
                    >
                        <div className="d-flex justify-content-between h6 fw-bold">
                            <div>
                                Add {text}
                            </div>
                            <div onClick={handleClick}>
                                <IoMdClose />
                            </div>
                        </div>
                        <TextField className='my-1'
                            value={searchValue}
                            onChange={searchProject}
                            id="left-search"
                            fullWidth
                            size='small'
                            placeholder='Search By keywords'
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <div style={{ height: '380px', overflowY: "scroll", scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {dataSource?.map((tem, index) => (
                                <div
                                    onClick={() => handleNode(randomImage.img, text, index)}
                                    className="bg-box d-flex p-2 rounded align-items-center my-2"
                                    key={index}
                                >
                                    <img src={randomImage.img} alt="" width={40} className='mx-2' />
                                    <img src={randomImage.line} alt="" className='mx-2' width={8} />
                                    <div className='fw-bold m-0'>{tem?.data_src_name} </div>
                                </div>
                            ))}
                        </div>
                        {text == 'Source' && (<div className='m-auto text-center mff' >
                            <button onClick={openPopUp} type="button" className="btn btn-dark p-2">Configure A New Source <span className='h5'> +</span></button>
                        </div>)}
                    </div>
                )}
            </div>
            <NewSourcePopUp isOpen={selected} onClose={closePopup} />
        </>

    );
};

export default ExpandableButton;
