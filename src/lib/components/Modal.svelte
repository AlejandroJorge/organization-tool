<script lang="ts">
  let { isOpen = $bindable(), children, onCloseRequest }: { isOpen: boolean; children: any; onCloseRequest?: () => boolean | Promise<boolean | void> } = $props();

  async function closeModal() {
    if (onCloseRequest) {
      const shouldClose = await onCloseRequest();
      if (shouldClose === false)
        return;
    }

    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen || event.key !== "Escape")
      return;

    event.preventDefault();
    event.stopPropagation();
    void closeModal();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if isOpen}
  <div
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75"
    role="presentation"
    onpointerdown={() => void closeModal()}
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-[min(92vw,48rem)] rounded-2xl border border-white/10 bg-[var(--surface-2,#0d1322)] p-7 text-slate-100 shadow-[0_45px_120px_rgba(2,3,10,0.85)]"
        role="dialog"
        aria-modal="true"
        onpointerdown={(e) => e.stopPropagation()}
      >
        <button
          class="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-2xl border border-white/10 text-base font-semibold text-slate-400 transition hover:text-white"
          type="button"
          onclick={() => void closeModal()}
          aria-label="Close modal"
        >
          ×
        </button>
        {@render children()}
      </div>
    </div>
  </div>
{/if}
