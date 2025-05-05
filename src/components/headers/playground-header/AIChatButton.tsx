import { useState } from 'react';
import { motion } from 'framer-motion';
import ai from '/assets/ai/ai.svg';
import { ChatSlidingPortal } from '../flow-playground-header/components/ChatSlidingPortal';
import { PipeLineChatSlidingPortal } from '../build-playground-header/components/PipeLineChatSlidingPortal';
import { Hammer } from 'lucide-react';

interface AIButtonProps {
    variant: 'flow' | 'pipeline';
    color?: string;
}

export const AIButton = ({ variant, color = '#ffffff' }: AIButtonProps) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

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
                onClick={() => setIsChatOpen(!isChatOpen)}
                title={variant === 'pipeline' ? 'Toggle Pipeline Assistant' : 'Toggle AI Assistant'}
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
            {variant === 'pipeline' ? (
                <PipeLineChatSlidingPortal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    imageSrc={ai}
                />
            ) : (
                <ChatSlidingPortal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    imageSrc={ai}
                />
            )}
        </motion.div>
    );
};