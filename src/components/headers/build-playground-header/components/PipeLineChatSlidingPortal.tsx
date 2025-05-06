import React, { useEffect } from "react";
import { PipeLineChatPanel } from "@/features/designers/pipeline/components/PipeLineChatPanel";
import { PipeLineChatProvider } from "@/context/designers/PipeLineChatContext";
import { useSidebar } from "@/context/SidebarContext";

interface PipeLineChatSlidingPortalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

export const PipeLineChatSlidingPortal: React.FC<PipeLineChatSlidingPortalProps> = ({
  isOpen,
  onClose,
  imageSrc
}) => {
  const { setRightAsideContent, rightAsideContent, closeRightAside } = useSidebar();

  // When the component mounts or isOpen changes, update the right aside content
  useEffect(() => {
    if (isOpen) {
      const chatPanel = (
        <PipeLineChatProvider onClose={onClose}>
          <PipeLineChatPanel 
            imageSrc={imageSrc}
            // onClose={onClose}
          />
        </PipeLineChatProvider>
      );
      
      setRightAsideContent(chatPanel, 'Pipeline Assistant');
    } else {
      // When closing, clear the content
      closeRightAside();
    }
  }, [isOpen, imageSrc, onClose, setRightAsideContent, closeRightAside]);

  // This component doesn't render anything directly, it just controls the RightAside
  return null;
};