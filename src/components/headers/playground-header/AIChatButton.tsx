import React from 'react';
import { motion } from 'framer-motion';
import ai from '/assets/ai/ai.svg';
import { useSidebar } from '@/context/SidebarContext';
import { FlowChatUI } from '../flow-playground-header/components/FlowChatUI'; 
import { Hammer } from 'lucide-react';
import { PipeLineChatSlidingPortal } from '../build-playground-header/components/PipeLineChatSlidingPortal';
import { PipeLineChatPanel } from '@/features/designers/pipeline/components/PipeLineChatPanel';

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
        const ChatComponentToRender = variant === 'flow' ? FlowChatUI : PipeLineChatSlidingPortal;

        if (isChatCurrentlyOpen) {
            closeRightAside();
        } else {
            // Add a delay to let the UI adjust layout properly
            document.body.classList.add('right-aside-opening');
            
            setRightAsideContent(
                <ChatComponentToRender 
                  key={CHAT_UI_COMPONENT_KEY} 
                  imageSrc={ai} 
                />,
                'AI Chat'
            );
            
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