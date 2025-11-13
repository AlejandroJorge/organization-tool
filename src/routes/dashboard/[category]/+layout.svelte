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

<section class="space-y-6">
  <header
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b0f1c] px-5 py-4"
  >
    <div class="space-y-2">
      <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Working on</p>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-semibold text-white">{categoryName}</h1>
        <button
          class="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-white/30 hover:text-white"
          type="button"
          onclick={() => {
            isRenameModalOpen = true;
          }}
        >
          Rename
        </button>
      </div>
    </div>
    <nav
      class="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 text-sm text-slate-300"
      aria-label="Category sections"
    >
      <a
        href={`/dashboard/${categoryId}/tasks`}
        class={`rounded-xl cursor-pointer px-3.5 py-1.5 font-medium transition ${
          currentSection == "tasks"
            ? "bg-white/20 text-white shadow-inner shadow-black/30"
            : "text-slate-400 hover:text-white"
        }`}
      >Tasks</a>
      <a
        href={`/dashboard/${categoryId}/notes`}
        class={`rounded-xl cursor-pointer px-3.5 py-1.5 font-medium transition ${
          currentSection == "notes"
            ? "bg-white/20 text-white shadow-inner shadow-black/30"
            : "text-slate-400 hover:text-white"
        }`}
      >Notes</a>
    </nav>
  </header>

  {@render children()}
</section>

<Modal bind:isOpen={isRenameModalOpen}>
  <form
    action={`/dashboard/${categoryId}?/renameCategory`}
    method="POST"
    class="flex flex-col gap-6"
    use:enhance={handleRenameResult}
  >
    <div>
      <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Rename category</p>
      <p class="mt-2 text-lg font-semibold text-white">
        Give "{categoryName}" a new name
      </p>
      <p class="text-sm text-slate-400">
        Keep names short, descriptive, and easy to scan from the sidebar.
      </p>
    </div>
    <label class="flex flex-col gap-2 text-sm text-white/90">
      <span class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Category name</span>
      <input
        class="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-2 text-base text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
        type="text"
        name="name"
        bind:value={renameValue}
        placeholder="e.g. Product Ops"
        minlength="2"
        required
      />
    </label>
    <div class="flex justify-end gap-3">
      <button
        class="rounded-xl border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 cursor-pointer"
        type="button"
        onclick={() => {
          isRenameModalOpen = false;
          renameValue = categoryName;
        }}
      >
        Cancel
      </button>
      <button
        class="rounded-xl bg-[var(--brand,#f1b24a)] px-5 py-2 text-sm font-semibold text-[#05060c] transition hover:brightness-110 cursor-pointer"
        type="submit"
      >
        Save
      </button>
    </div>
  </form>
</Modal>
