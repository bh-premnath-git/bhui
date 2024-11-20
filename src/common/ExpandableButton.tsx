import { InputAdornment, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import NewSourcePopUp from '../components/BuildPipeLineComps/NewSourcePopUp';
import { useDispatch, useSelector } from 'react-redux';
import { getSource } from '../redux/BuildPipeLineSlice';
import { RootState } from '@/store/store';
import TransformationPanel from '@/components/BuildPipeLineComps/TransformationPanel';
import transformList from '@/pages/buildPipeLine/build_pipe_line_flow.json';

const ExpandableButton = ({ icon, text, className, style, title, addNode, dataSet, expandIcon }: any) => {
    const [showText, setShowText] = useState(false);
    const [hover, setHover] = useState(false);
    const [selected, setSelected] = React.useState(false);
    const dispatch = useDispatch();
    const { dataSource } = useSelector((state: RootState) => state.buildPipeLineApi);
    const [select, setSelect] = useState(null);

    const handleClick = () => {
        setShowText(!showText);
        setSelect(null);
    };
    async function handlePop(text: any) {
        await handleClick();
        setSelect(text)
        setShowText(!showText);
        if (text === 'Filter') {
            addNode('/assets/buildPipeline/display/filter.svg', title, 'Filter');
        } else if (text === 'Join') {
            addNode('/assets/buildPipeline/display/join.svg', title, 'Join');
        } else if (text === 'Router') {
            addNode('/assets/buildPipeline/display/route.svg', title, 'Router');
        } else if (text === 'Transform') {
            addNode('/assets/buildPipeline/display/transform.svg', title, 'Transform');
        } else if (text === 'Ship') {
            addNode('/assets/buildPipeline/display/ship.svg', title, 'Ship');
        }
    }
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
    function handleNode(lead: any, title: any, index: any, tem: any) {
        addNode(lead, title, index, tem);
        handleClick();
    }
    function makeCard(tem: any, index: any) {
        const randomImage = getRandomImage()
        return (
            < div
                onClick={() => handleNode(randomImage.img, text, tem.data_src_name, tem)}
                className="bg-box d-flex p-2 rounded align-items-center my-2"
                key={index}
            >
                <img src={randomImage.img} alt="" width={40} className='mx-2' />
                <img src={randomImage.line} alt="" className='mx-2' width={8} />
                <div className='fw-bold m-0'>{tem?.data_src_name} </div>
            </div >
        )

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

    return (
        <>
        <div style={{ marginBottom: '10px', transition: 'margin-bottom 0.3s ease-in-out' }}>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <button
                    onClick={() => handlePop(text)}
                    className='mx-2 rounded-sm text-white flex items-center transition-all duration-500 ease-in-out'
                    style={{
                        backgroundColor: expandIcon,
                        padding: hover ? '1px 5px' : '1px',  // Padding change on hover for a smoother effect
                        transition: 'background-color 0.3s ease-in-out, padding 0.3s ease-in-out'
                    }}
                >
                    {hover ? (
                        <div className='flex items-center transition-all duration-500 ease-in-out'>
                            <img src={icon} alt="" width={32}/>
                            <div className='ml-2 opacity-100 transition-opacity duration-500 ease-in-out'>
                                {text}
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center transition-all duration-300 ease-in-out'>
                            <img src={icon} alt="" width={32}/>
                            
                        </div>
                    )}
                </button>
            </div>
    
            {(select === 'Source' || select === 'Target') && (
                <div className='rounded w-96 shadow-sm'
                    style={{
                        marginTop: '10px',
                        padding: '10px',
                        border: '1px solid #f2f2f2',
                        backgroundColor: '#fff',
                        position: 'absolute',
                        zIndex: 1000,
                        left: '40vh'
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
                    {dataSource?.length > 0 && (
                        <TextField
                            className='my-1'
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
                    )}
                    <div style={{ height: '380px', overflowY: "scroll", scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {dataSource?.map((tem: any, index: any) => (
                            makeCard(tem, index)
                        ))}
                    </div>
                    {text === 'Source' && (
                        <div className='m-auto text-center mff'>
                            <button onClick={openPopUp} type="button" className="btn btn-dark p-2">
                                Configure A New Source <span className='h5'> +</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
    
            {select === '' && (
                <TransformationPanel
                    dataSource={dataSource}
                    searchValue={searchValue}
                    searchProject={searchProject}
                    handleClick={handleClick}
                    transformList={transformList.transformList}
                    handleNode={handleNode}
                    text={text}
                    openPopUp={openPopUp}
                />
            )}
        </div>
        <NewSourcePopUp isOpen={selected} onClose={closePopup} />
    </>
    

    );
};

export default ExpandableButton;
