<script lang="ts">
  import { setContext } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import {
    toastContextKey,
    type ToastController,
    type ToastType
  } from "$lib/components/toast-context";

  type ToastEntry = { id: number; message: string; type: ToastType };

  let { children } = $props();
  let nextId = 0;
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let toasts = $state<ToastEntry[]>([]);

  const dismiss = (id: number) => {
    toasts = toasts.filter((toast) => toast.id !== id);
    const timeout = timers.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timers.delete(id);
    }
  };

  const show = (message: string, type: ToastType = "success") => {
    if (!message) return;
    const id = ++nextId;
    toasts = [...toasts, { id, message, type }];
    timers.set(
      id,
      setTimeout(() => {
        dismiss(id);
      }, 3000)
    );
  };

  const controller: ToastController = {
    show,
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    dismiss
  };

  setContext(toastContextKey, controller);

  $effect(() => {
    return () => {
      timers.forEach((timeout) => clearTimeout(timeout));
      timers.clear();
    };
  });
</script>

{@render children()}

{#if toasts.length > 0}
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-3 px-4">
    {#each toasts as toast (toast.id)}
      <Toast message={toast.message} type={toast.type} />
    {/each}
  </div>
{/if}
