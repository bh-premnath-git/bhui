import React from 'react';
import { motion } from 'framer-motion';
import ai from '/assets/ai/ai.svg';
import { useSidebar } from '@/context/SidebarContext';
import { FlowChatSlidingPortal } from '../flow-playground-header/components/FlowChatSlidingPortal';
import PipeLineChatSlidingPortal from '../build-playground-header/components/PipeLineChatSlidingPortal';
import { DataTable } from '@/components/bh-table/data-table';
import { setIsRightPanelOpen } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useDispatch } from 'react-redux';

interface AIButtonProps {
    variant: 'flow' | 'pipeline';
    color?: string;
}

const CHAT_UI_COMPONENT_KEY = 'flow-chat-ui';

// Note: Static messages are already defined in PipeLineChatMock component

// Mock data for the DataTable related to the pipeline chat
const mockTableData = [
    {
        order_id: 1001,
        customer_id: 5001,
        product_name: 'Laptop',
        quantity: 1,
        price: 1299.99,
        order_date: '2023-04-15',
        status: 'Delivered',
        order_count: 1
    },
    {
        order_id: 1002,
        customer_id: 5002,
        product_name: 'Smartphone',
        quantity: 2,
        price: 899.99,
        order_date: '2023-04-16',
        status: 'Processing',
        order_count: 1
    },
    {
        order_id: 1003,
        customer_id: 5001,
        product_name: 'Headphones',
        quantity: 1,
        price: 249.99,
        order_date: '2023-04-17',
        status: 'Shipped',
        order_count: 2
    },
    {
        order_id: 1004,
        customer_id: 5003,
        product_name: 'Monitor',
        quantity: 2,
        price: 349.99,
        order_date: '2023-04-18',
        status: 'Delivered',
        order_count: 1
    },
    {
        order_id: 1005,
        customer_id: 5002,
        product_name: 'Keyboard',
        quantity: 1,
        price: 129.99,
        order_date: '2023-04-19',
        status: 'Processing',
        order_count: 2
    },
];

// Mock columns for the DataTable
const mockTableColumns = [
    { accessorKey: 'order_id', header: 'Order ID' },
    { accessorKey: 'customer_id', header: 'Customer ID' },
    { accessorKey: 'product_name', header: 'Product' },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'order_count', header: 'Order Count' },
];

export const AIButton = ({ variant, color = '#ffffff' }: AIButtonProps) => {
    const {
        setRightAsideContent,
        closeRightAside,
        isRightAsideOpen,
        rightAsideContent,
        setBottomDrawerContent,
        closeBottomDrawer,
        isBottomDrawerOpen
    } = useSidebar();
    const dispatch = useDispatch();
    // Check if the FlowChatUI component is currently displayed
    const isChatCurrentlyOpen = isRightAsideOpen &&
        rightAsideContent &&
        (rightAsideContent as React.ReactElement).key === CHAT_UI_COMPONENT_KEY;

    const handleButtonClick = () => {
        const ChatComponentToRender = variant === 'flow' ? FlowChatSlidingPortal : PipeLineChatSlidingPortal;

        if (isChatCurrentlyOpen) {
            closeRightAside();
            closeBottomDrawer();
            dispatch(setIsRightPanelOpen(false));

        } else {
            // Add a delay to let the UI adjust layout properly
            document.body.classList.add('right-aside-opening');
            dispatch(setIsRightPanelOpen(true));
            // Set right aside content
            setRightAsideContent(
                <ChatComponentToRender
                    key={CHAT_UI_COMPONENT_KEY}
                    imageSrc={ai}
                />,
                variant === 'flow' ? 'Agent Flow' : 'Agent Pipeline'
            );

            // Set bottom drawer content with mock data table
            // if(variant === 'pipeline') {
            // setBottomDrawerContent(
            //     <div className=" w-full h-full">
            //         <DataTable 
            //             data={mockTableData}
            //             columns={mockTableColumns}
            //             topVariant="simple"
            //             pagination={true}
            //         />
            //     </div>,
            //     'Pipeline Transformation Results'
            // );}

            // Trigger a resize event to help ReactFlow adjust
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                document.body.classList.remove('right-aside-opening');
            }, 50);
        }
    };

    return (
        <motion.div
            className="relative inline-flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.button
                className="relative w-8 h-8 rounded-full group flex items-center justify-center hover:bg-accent"
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.05, opacity: 0.9 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleButtonClick}
                aria-label={isChatCurrentlyOpen ? 'Close AI Chat' : 'Open AI Chat'}
            >
                <motion.img
                    src={ai}
                    alt="ai"
                    className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
                    initial={{ rotate: -45 }}
                    animate={{ rotate: -40 }}
                    transition={{ type: 'spring', stiffness: 150 }}
                />
            </motion.button>
        </motion.div>
    );
};