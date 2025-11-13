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
    class="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
    role="presentation"
    onpointerdown={() => void closeModal()}
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-3xl rounded-xl border border-white/12 bg-[#05070f] p-6 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.65)] max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onpointerdown={(e) => e.stopPropagation()}
      >
        <button
          class="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-slate-400 transition hover:text-white"
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
