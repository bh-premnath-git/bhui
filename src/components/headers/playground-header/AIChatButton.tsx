import React from 'react';
import { motion } from 'framer-motion';
import ai from '/assets/ai/ai.svg';
import { useSidebar } from '@/context/SidebarContext';
// Import the new, extracted UI component
// import { ChatSlidingPortal } from '../flow-playground-header/components/ChatSlidingPortal';
import { FlowChatUI } from '../flow-playground-header/components/FlowChatUI'; 

// Remove the placeholder component definition
/*
const AIChatInterface = () => {
  return (
    <div>
      <h2>AI Chat</h2>
      <p>Chat interface goes here...</p>
    </div>
  );
};
*/

interface AIButtonProps {
    variant: 'flow' | 'pipeline';
    color?: string;
}

// Use a key specific to the new component
const CHAT_UI_COMPONENT_KEY = 'flow-chat-ui';

export const AIButton = ({ variant, color = '#ffffff' }: AIButtonProps) => {
    const { setRightAsideContent, closeRightAside, isRightAsideOpen, rightAsideContent } = useSidebar();

    // Check if the FlowChatUI component is currently displayed
    const isChatCurrentlyOpen = isRightAsideOpen && 
                                rightAsideContent && 
                                (rightAsideContent as React.ReactElement).key === CHAT_UI_COMPONENT_KEY;

    const handleButtonClick = () => {
        // For now, use FlowChatUI for both variants
        // If pipeline needs a different UI, create a similar extracted component for it
        const ChatComponentToRender = FlowChatUI; 

        if (isChatCurrentlyOpen) {
            closeRightAside();
        } else {
            setRightAsideContent(
                // Render the extracted FlowChatUI component directly
                <ChatComponentToRender 
                  key={CHAT_UI_COMPONENT_KEY} 
                  // Pass any necessary props - imageSrc might be needed if FlowChatUI uses it
                  imageSrc={ai} 
                />,
                'AI Chat', // Set the title
                'w-[600px]' // Set the desired width
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