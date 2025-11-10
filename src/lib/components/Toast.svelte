<script lang="ts">
  import type { ToastType } from "./toast-context";

  let { message = "", type = "success" }: { message?: string; type?: ToastType } = $props();

  const variantClasses = $derived(
    type === "success"
      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
      : "border-rose-400/50 bg-rose-500/10 text-rose-100"
  );
</script>

<div
  class={`pointer-events-auto flex min-w-[240px] items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl shadow-black/40 ${variantClasses}`}
  role="status"
  aria-live="polite"
>
  <span>{message}</span>
</div>
