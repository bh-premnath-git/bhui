import React from 'react';

interface NodeImageProps {
    data: any;
    isSelected: boolean;
    onImageClick: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    formStates: any;
    id: string;
}

export const NodeImage: React.FC<NodeImageProps> = ({
    data,
    isSelected,
    onImageClick,
    onMouseEnter,
    onMouseLeave,
}) => {
    return (
        <div className="relative bg-white rounded-lg">
            <div
                className="relative group"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className={`rounded-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
                    }`}>
                    <img
                        src={data.icon}
                        alt={data.label}
                        className="w-14 h-14 object-contain cursor-pointer relative"
                        onDoubleClick={onImageClick}
                        style={{ display: 'block' }}
                    />
                    {(data.label?.toLowerCase() === 'reader' || data.title?.toLowerCase() === 'reader') && (
                        <img className='absolute w-5 h-5' src="/assets/buildPipeline/snow.svg" alt="" style={{ bottom: 0, right: 0 }} />
                    )}

                    {(data.label?.toLowerCase() === 'target' || data.title?.toLowerCase() === 'target') && (
                        <img className='absolute w-5 h-5' src="/assets/buildPipeline/big.svg" alt="" style={{ bottom: 0, right: 0 }} />
                    )}
                </div>


            </div>
        </div>
    );
}; 