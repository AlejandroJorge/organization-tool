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
    class="fixed inset-0 z-50 grid place-items-center bg-black/50"
    onclick={closeModal}
  >
    <div
      class="relative rounded-lg bg-white p-8 text-black"
      onclick={(e) => e.stopPropagation()}
    >
      <button
        class="absolute top-2 right-2 cursor-pointer text-2xl leading-none"
        type="button"
        onclick={closeModal}
        aria-label="Close modal"
      >
        &times;
      </button>
      {@render children()}
    </div>
  </div>
{/if}
