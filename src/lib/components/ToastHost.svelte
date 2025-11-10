<script lang="ts">
  import Toast from "$lib/components/Toast.svelte";
  import { toast, type ToastEntry } from "$lib/components/toast-store";

  let queue = $state<ToastEntry[]>([]);

  const unsubscribe = toast.subscribe((value) => {
    queue = value;
  });

  $effect(() => {
    return () => {
      unsubscribe();
    };
  });
</script>

{#if queue.length > 0}
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-3 px-4">
    {#each queue as entry (entry.id)}
      <Toast message={entry.message} type={entry.type} />
    {/each}
  </div>
{/if}
