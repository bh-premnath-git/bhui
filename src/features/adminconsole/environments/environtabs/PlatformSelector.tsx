/**
 * @file PlatformSelector.tsx
 *
 * A small component to let the user select between different cloud platforms.
 */
import React from "react";
import { Check } from "lucide-react";
import { Platform, PLATFORMS } from "@/types/features/environment/types";

interface PlatformSelectorProps {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  disabledPlatforms?: string[];
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  setSelectedPlatform,
  disabledPlatforms = [],
}) => {
  return (
    <div className="flex flex-wrap gap-6">
      {PLATFORMS.map((platform: Platform) => {
        const isDisabled = disabledPlatforms.includes(platform.id);

        return (
          <div
            key={platform.id}
            className={[
              "flex flex-row items-center space-x-3 border rounded-md p-1 transition-all duration-200",
              selectedPlatform === platform.id
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-700 bg-gray-50",
              isDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-200 hover:shadow-sm",
            ].join(" ")}
            onClick={() => {
              if (!isDisabled) {
                setSelectedPlatform(platform.id);
              }
            }}
            style={{ width: "250px", minWidth: "200px" }}
          >
            {/* Radio button-like circle */}
            <div
              className={[
                "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200",
                selectedPlatform === platform.id
                  ? "border-green-500 bg-green-500"
                  : "border-gray-700 bg-gray-200",
              ].join(" ")}
            >
              {selectedPlatform === platform.id && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            {/* Platform logo & name */}
            <div className="flex flex-col items-center flex-grow text-center">
              <img
                src={platform.logo}
                alt={`${platform.name} logo`}
                className="w-10 h-10 mb-1"
              />
              <span className="text-xs font-medium text-gray-800">
                {platform.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
