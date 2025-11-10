import { getContext } from "svelte";

export type ToastType = "success" | "error";

export type ToastController = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: number) => void;
};

export const toastContextKey = Symbol("toast-context");

export const useToast = (): ToastController => {
  const context = getContext<ToastController | null>(toastContextKey);
  if (!context) {
    throw new Error("ToastProvider is missing in the component tree.");
  }
  return context;
};
