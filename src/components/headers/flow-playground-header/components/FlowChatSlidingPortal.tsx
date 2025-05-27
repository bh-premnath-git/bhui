import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import ai from "/assets/ai/ai.svg";
import FlowChatPanel from "@/features/designers/flow/components/FlowChatPanel";

interface FlowChatSlidingPortalProps {
  isOpen?: boolean;
  onClose?: () => void;
  imageSrc?: string;
}

export const FlowChatSlidingPortal: React.FC<FlowChatSlidingPortalProps> = ({
  isOpen = true,
  onClose,
  imageSrc = ai
}) => {
  return (
    <FlowChatPanel />
  );
};

export default FlowChatSlidingPortal;