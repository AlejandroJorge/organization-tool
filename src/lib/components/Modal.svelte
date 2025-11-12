<script lang="ts">
  let { isOpen = $bindable(), children } = $props();

  function closeModal() {
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closeModal();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if isOpen}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/75"
    role="presentation"
    onpointerdown={closeModal}
  >
    <div
      class="relative w-[min(92vw,48rem)] rounded-2xl border border-white/10 bg-[var(--surface-2,#0d1322)] p-7 text-slate-100 shadow-[0_45px_120px_rgba(2,3,10,0.85)]"
      role="dialog"
      aria-modal="true"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <button
        class="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-2xl border border-white/10 text-base font-semibold text-slate-400 transition hover:text-white"
        type="button"
        onclick={closeModal}
        aria-label="Close modal"
      >
        ×
      </button>
      {@render children()}
    </div>
  </div>
{/if}
