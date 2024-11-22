import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaybackButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlaybackButton({ isPlaying, onToggle }: PlaybackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg ml-4 mr-4"
      onClick={onToggle}
    >
      {isPlaying ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Play className="h-5 w-5" />
      )}
    </Button>
  );
}