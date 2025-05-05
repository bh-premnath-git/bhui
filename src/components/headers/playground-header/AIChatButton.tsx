import React from 'react';
import { motion } from 'framer-motion';
import ai from '/assets/ai/ai.svg';
import { useSidebar } from '@/context/SidebarContext';
import { FlowChatUI } from '../flow-playground-header/components/FlowChatUI'; 

interface AIButtonProps {
    variant: 'flow' | 'pipeline';
    color?: string;
}

const CHAT_UI_COMPONENT_KEY = 'flow-chat-ui';

export const AIButton = ({ variant, color = '#ffffff' }: AIButtonProps) => {
    const { setRightAsideContent, closeRightAside, isRightAsideOpen, rightAsideContent } = useSidebar();

    // Check if the FlowChatUI component is currently displayed
    const isChatCurrentlyOpen = isRightAsideOpen && 
                                rightAsideContent && 
                                (rightAsideContent as React.ReactElement).key === CHAT_UI_COMPONENT_KEY;

    const handleButtonClick = () => {
        const ChatComponentToRender = variant === 'flow' ? FlowChatUI : FlowChatUI;

        if (isChatCurrentlyOpen) {
            closeRightAside();
        } else {
            setRightAsideContent(
                <ChatComponentToRender 
                  key={CHAT_UI_COMPONENT_KEY} 
                  imageSrc={ai} 
                />,
                'AI Chat',
                'w-[520px]'
            );
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
                {variant === 'pipeline' ? (
                    <Hammer className="w-4 h-4 text-white" />
                ) : (
                    <motion.img
                        src={ai}
                        alt="ai"
                        className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
                        initial={{ rotate: -45 }}
                        animate={{ rotate: -40 }}
                        transition={{ type: 'spring', stiffness: 150 }}
                    />
                )}
            </motion.button>
        </motion.div>
    );
};