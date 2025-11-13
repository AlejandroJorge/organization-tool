<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import Modal from "$lib/components/Modal.svelte";
  import { createErrorToastEnhancer } from "$lib/utils/toast-errors";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { LayoutProps } from "./$types";

  let { children, data, params }: LayoutProps = $props();
  const categoryId = $derived(params.category);
  const categoryRecord = $derived(data.category);
  const categoryName = $derived(categoryRecord.name);

  const currentSection = $derived(page.route.id?.split("/").at(-1));

  let isRenameModalOpen = $state(false);
  let renameValue = $state("");

  $effect(() => {
    renameValue = categoryName;
  });

  const handleRenameResult: SubmitFunction = createErrorToastEnhancer({
    onSuccess: () => {
      isRenameModalOpen = false;
      renameValue = categoryName;
    }
  });
</script>

<section class="space-y-5">
  <header class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#06080f] px-4 py-3 text-sm text-slate-300">
    <div class="space-y-1">
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-500">Working on</p>
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-xl font-semibold text-white">{categoryName}</h1>
        <button
          class="inline-flex cursor-pointer items-center rounded-lg border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200 hover:border-white/40"
          type="button"
          onclick={() => {
            isRenameModalOpen = true;
          }}
        >
          Rename
        </button>
      </div>
    </div>
    <nav class="inline-flex items-center gap-2 rounded-full border border-white/15 px-2 py-1 text-[11px] uppercase tracking-[0.35em]" aria-label="Category sections">
      <a
        href={`/dashboard/${categoryId}/tasks`}
        class={`rounded-full px-3 py-1 ${currentSection == "tasks" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"}`}
      >Tasks</a>
      <a
        href={`/dashboard/${categoryId}/notes`}
        class={`rounded-full px-3 py-1 ${currentSection == "notes" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"}`}
      >Notes</a>
    </nav>
  </header>

  {@render children()}
</section>

<Modal bind:isOpen={isRenameModalOpen}>
  <form
    action={`/dashboard/${categoryId}?/renameCategory`}
    method="POST"
    class="flex w-full flex-col gap-4"
    use:enhance={handleRenameResult}
  >
    <div class="space-y-1">
      <p class="text-[10px] uppercase tracking-[0.45em] text-slate-500">Rename category</p>
      <p class="text-lg font-semibold text-white">Give "{categoryName}" a new name</p>
    </div>
    <label class="flex flex-col gap-2 text-sm text-white/90">
      <span class="text-[10px] uppercase tracking-[0.4em] text-slate-500">Category name</span>
      <input
        class="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
        type="text"
        name="name"
        bind:value={renameValue}
        placeholder="e.g. Product Ops"
        minlength="2"
        required
      />
    </label>
    <div class="flex justify-end gap-2">
      <button
        class="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
        type="button"
        onclick={() => {
          isRenameModalOpen = false;
          renameValue = categoryName;
        }}
      >
        Cancel
      </button>
      <button
        class="rounded-xl bg-[var(--brand,#f1b24a)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#05060c]"
        type="submit"
      >
        Save
      </button>
    </div>
  </form>
</Modal>
