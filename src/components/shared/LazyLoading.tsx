import loaderLogo from "/assets/logo/loaderLogo.svg";
import { cn } from "@/lib/utils";

interface LazyLoadingProps {
  /**
   * If true, the loader will take up the full screen.
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Custom class for the spinning loader container. Can be used to set size (e.g., "w-20 h-20").
   */
  className?: string;
  /**
   * Custom class for the top-level container div.
   */
  containerClassName?: string;
  /**
   * Whether to show the "Loading" text.
   * @default true
   */
  showText?: boolean;
}

export const LazyLoading = ({
  fullScreen = true,
  className,
  containerClassName,
  showText = true,
}: LazyLoadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "min-h-screen bg-white",
        containerClassName
      )}
    >
      <div className={cn("relative w-40 h-40", className)}>
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
          <img src={loaderLogo} width={58} height={58} alt="loaderlogo" />
        </div>
      </div>

      {showText && (
        <div className="mt-8 text-gray-700 font-light tracking-wider text-xl">
          Loading
        </div>
      )}

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
