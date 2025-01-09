import React from "react";
import { cn } from "@/lib/utils";
import loaderLogo from "/assets/logo/loaderLogo.svg"; // Adjust path as needed

interface SpinnerProps {
  className?: string;
  showLoadingTxt?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  showLoadingTxt = true,
}) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center bg-white", className)}
    >
      {/* Outer container for the spinner */}
      <div className="relative w-40 h-40">
        {/* Inner spinning circles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full origin-center"
              style={{
                transform: `rotate(${i * 60}deg)`,
              }}
            >
              <div className="absolute top-0 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="w-full h-full rounded-full bg-black/70 blur-[2px] animate-pulse-scale"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Outer rotating ring */}
        <svg className="absolute inset-0 animate-reverse-spin" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2.5"
            strokeDasharray="30 10"
            className="animate-stroke-dash"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="100%" stopColor="#333333" />
            </linearGradient>
          </defs>
        </svg>

        {/* Middle ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-black/20 animate-pulse" />
        </div>

        {/* Center element (logo) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={loaderLogo} width={58} height={58} alt="loaderlogo" />
        </div>
      </div>

      {/* Conditionally display the "Loading" text */}
      {showLoadingTxt && (
        <div className="mt-8 text-gray-700 font-light tracking-wider text-xl">
          Loading
        </div>
      )}

      {/* Inline styles for custom animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes stroke-dash {
            to {
              stroke-dashoffset: -40;
            }
          }

          @keyframes pulse-scale {
            0%, 100% { transform: scale(0.5); opacity: 0.3; }
            50% { transform: scale(1); opacity: 0.8; }
          }

          .animate-stroke-dash {
            animation: stroke-dash 2s linear infinite;
          }

          .animate-pulse-scale {
            animation: pulse-scale 2s ease-in-out infinite;
          }

          .animate-reverse-spin {
            animation: spin 8s linear infinite reverse;
          }
        `,
        }}
      />
    </div>
  );
};
