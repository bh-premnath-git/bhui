import { cn } from "@/lib/utils";
import loaderLogo from "/assets/logo/loaderLogo.svg";

interface SpinnerProps {
  className?: string;
  classNameContainer?: string;
}

export const LoadingState = ({ className, classNameContainer }: SpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative w-40 h-40", classNameContainer)}>
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full origin-center"
              style={{
                transform: `rotate(${i * 60}deg)`,
              }}
            >
              <div className="absolute top-0 left-1/2 w-[10%] aspect-square -translate-x-1/2 -translate-y-1/2">
                <div
                  className="w-full h-full rounded-full bg-black/70 blur-[1px] animate-pulse-scale"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

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

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/5 aspect-square rounded-full border-2 border-black/20 animate-pulse" />
        </div>

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