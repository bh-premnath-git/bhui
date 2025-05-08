import React, { useEffect } from "react";
import { PipeLineChatPanel } from "@/features/designers/pipeline/components/PipeLineChatPanel";
import { PipeLineChatProvider } from "@/context/designers/PipeLineChatContext";
import { useSidebar } from "@/context/SidebarContext";
import ai from "/logo.svg";
import { PipeLineChatMock } from "@/features/designers/pipeline/components/PipeLineChatMock";
interface PipeLineChatSlidingPortalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

export const PipeLineChatSlidingPortal: React.FC<PipeLineChatSlidingPortalProps> = ({
  isOpen=true,
  onClose,
  imageSrc=ai
}) => {
  return(
    <>
    <PipeLineChatProvider onClose={onClose}>
    <PipeLineChatMock
      // onClose={onClose}
    />
  </PipeLineChatProvider>
    </>
  )
};