import React from 'react';
interface CustomNodeData {
    image?: {
        url: string;
        alt: string;
    };
    label?: string;
}
interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    nodeData: CustomNodeData | null;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, nodeData }) => {
    if (!isOpen || !nodeData) return null;

    return (
        <div style={overlayStyle}>
            <div style={popupStyle}>
                <button className='text-dark' onClick={onClose}>Close</button>
                {nodeData.image && (
                    <div>
                        {/* <img src={nodeData.image.url} alt={nodeData.image.alt} style={{ width: '100px' }} /> */}
                        <p>{nodeData.image.alt}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const popupStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

export default Popup;
