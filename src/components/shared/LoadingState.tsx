import { cn } from "@/lib/utils";
import loaderLogo from "/assets/logo/loaderLogo.svg";

interface SpinnerProps {
  className?: string;
  classNameContainer?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ className, classNameContainer, fullScreen = true }: SpinnerProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullScreen && "fixed inset-0 z-50",
      className
    )}>
      <div className={cn("relative w-40 h-40", classNameContainer)}>
        {/* Outer rotating ring with dashed stroke */}
        <svg className="absolute inset-0 animate-spin" viewBox="0 0 100 100">
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

        {/* Center element with loader logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[35%] aspect-square flex items-center justify-center">
            <img
              src={loaderLogo}
              className="w-full h-full object-contain"
              alt="loaderlogo"
            />
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes stroke-dash {
              to { stroke-dashoffset: -40; }
            }
            .animate-spin {
              animation: spin 2s linear infinite;
            }
            .animate-stroke-dash {
              animation: stroke-dash 2s linear infinite;
            }
          `,
        }}
      />
    </div>
  );
};
