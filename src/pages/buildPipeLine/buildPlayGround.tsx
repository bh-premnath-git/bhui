import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { getConfig, getSource, getTransformationCount, setIsDebug, setIsHover, setIsRun, startPipeLine, stopPipeLine } from "../../redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import BuildPipeLineFlow from "@/pages/buildPipeLine/buildPipeLineFlow";
import { CustomNodeData } from "@/components/BuildPipeLineComps/ImageNode";
import Codepage from "@/components/BuildPipeLineComps/CodePage";
import TransformPopUp from "@/components/BuildPipeLineComps/TransformPopUp";
import FilterPopUp from "@/components/BuildPipeLineComps/FilterPopUp";
import OrderPopUp from "@/components/BuildPipeLineComps/OrderPopUp";
import BuildPipePopup from "@/components/BuildPipeLineComps/BuildPipePopup";
import JoinNodeDtl from "@/components/BuildPipeLineComps/join/JoinNodeDtl";
import SortForm from "@/components/BuildPipeLineComps/SortForm";
import DeDupeForm from "@/components/BuildPipeLineComps/DeDupeForm";
import AggregateNodeDtl from "@/components/BuildPipeLineComps/aggregate/AggregateNodeDtl";
import { useParams } from "react-router-dom";
import schemaValidation from '@/pages/buildPipeLine/json_schema_validators.json';
import useToast from "@/oldcomponents/teast-service";
import { COLORS } from "@/Utils/constants";
import WrappedBuildPipeLineFlow from "@/pages/buildPipeLine/buildPipeLineFlow";

export default function BuildPlayGround() {
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [selectedNodeData, setSelectedNodeData] = useState<CustomNodeData | null>(null);
    const { isHover, selectedOption,isDebug }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    // const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const dispatch = useDispatch();
    const isToggled = useSelector((state: RootState) => state.toggle.isToggled);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const { id } = useParams();
    const pipeline = { pipeline_id: id };
    const [ToastComponent, showToast] = useToast();

    useEffect(() => {
        dispatch(getConfig({ connection_type: 'source' }));
        dispatch(getSource({ offset: 0, limit: 10, order_desc: false }));
        console.log('first' + selectedOption)
    }, [dispatch]);



    const closePopup = () => {
        setIsPopupOpen(false);
        setIsButtonClicked(false);
        dispatch(setIsHover(false))
    };

    const handleOverlayOpen = () => {
        setIsOverlayOpen(true);
    };
    const handleOverlayClose = () => {
        setIsOverlayOpen(false);
    };



    return (
        <div style={{ position: 'relative', height: '91.8vh' }}>
            {isToggled ? (
                <Codepage />
            ) : (
                <>

                    <WrappedBuildPipeLineFlow pipeline={pipeline} />
                    {selectedOption?.label?.toLowerCase().trim() === "transform" &&
                        <TransformPopUp isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {selectedOption?.label?.toLowerCase().trim() === "join" &&
                        <JoinNodeDtl isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {selectedOption?.label?.toLowerCase().trim() === "aggregate" &&
                        <AggregateNodeDtl isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {(selectedOption?.label?.toLowerCase().trim() === "filter"
                        || selectedOption?.label?.toLowerCase().trim() === "sql transformation"
                        || selectedOption?.label?.toLowerCase().trim() === "limit") &&
                        <FilterPopUp isOpen={isHover} onClose={closePopup} />
                    }
                    {selectedOption?.label?.toLowerCase().trim() === "source" &&
                        <OrderPopUp isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {selectedOption?.label?.toLowerCase().trim() === "sort" &&
                        <SortForm isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {selectedOption?.label?.toLowerCase().trim() === "dedupe" &&
                        <DeDupeForm isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }

                </>
            )}
            {/* <Footer com={<ControlPanel
                isButtonClicked={isButtonClicked}
                handleButtonClick={handleButtonClick}
                isPopupOpen={isPopupOpen}
                closePopup={closePopup}
                open1={open1}
                handleClose1={handleClose1}
                handleClose1Icon={handleClose1}
            />} /> */}
            <div style={{
                position: 'fixed',
                top: '75px', // Adjust as needed to be above the footer
                right: '1%',
                zIndex: 1
            }}>
                <Tooltip title="" placement="top">
                    <IconButton
                        style={{
                            borderRadius: '50%',
                            color: 'white',
                            width: '80px',
                            height: '80px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={handleOverlayOpen}
                    >
                        <img src="/assets/buildPipeline/bighammer.png" alt="bighammer" width={80} />
                    </IconButton>
                </Tooltip>
            </div>
            {isOverlayOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '400px',
                        height: '100%',
                        backgroundColor: 'white',
                        zIndex: 2,
                        color: 'black',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        alignItems: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    }}
                >

                    <BuildPipePopup closePopup={handleOverlayClose} />
                </div>

            )}
        </div>
    );
}