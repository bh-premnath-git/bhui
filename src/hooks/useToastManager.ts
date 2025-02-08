import { toast } from "sonner";

interface ToastOptions {
  duration?: number;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
}

export const useToastManager = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, options);
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, options);
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, options);
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, options);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};