import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import ai from "/assets/ai/ai.svg";
import FlowChatPanel from "@/features/designers/flow/components/FlowChatPanel";
import { FlowProvider } from "@/context/designers/FlowContext";
import { PipelineProvider } from "@/context/designers/DataPipelineContext";

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
  // We're wrapping the FlowChatPanel with the necessary context providers
  // This ensures it has access to the flow and pipeline data
  // In a real implementation, these providers would be properly configured
  // For this UI-only version, we're just ensuring the component structure is correct
  return (
    <div className="h-full">
      {/* In a real implementation, we would wrap FlowChatPanel with the actual providers */}
      {/* <FlowProvider>
        <PipelineProvider>
          <FlowChatPanel />
        </PipelineProvider>
      </FlowProvider> */}
      
      {/* For the UI-only version, we're using the component directly */}

      <FlowChatPanel />

    </div>
  );
};

export default FlowChatSlidingPortal;