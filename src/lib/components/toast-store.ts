import { writable } from "svelte/store";

export type ToastType = "success" | "error";

export type ToastEntry = {
  id: number;
  message: string;
  type: ToastType;
};

const { subscribe, update } = writable<ToastEntry[]>([]);

let nextId = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

const dismiss = (id: number) => {
  update((current) => current.filter((toast) => toast.id !== id));
  const timeout = timers.get(id);
  if (timeout) {
    clearTimeout(timeout);
    timers.delete(id);
  }
};

const show = (message: string, type: ToastType = "success") => {
  if (!message) return -1;
  const id = ++nextId;
  update((current) => [...current, { id, message, type }]);
  timers.set(
    id,
    setTimeout(() => {
      dismiss(id);
    }, 3000)
  );
  return id;
};

export const toast = {
  subscribe,
  show,
  success: (message: string) => show(message, "success"),
  error: (message: string) => show(message, "error"),
  dismiss
};
