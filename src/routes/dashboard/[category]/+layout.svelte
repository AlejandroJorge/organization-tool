<script lang="ts">
  import type { LayoutProps } from "./$types";
  import { page } from "$app/state";

  let { children, params }: LayoutProps = $props();
  const category = $derived(params.category);

  const currentSection = $derived(page.route.id?.split("/").at(-1));
</script>

<section class="space-y-6">
  <header
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b0f1c] px-5 py-4"
  >
    <div>
      <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Working on</p>
      <h1 class="text-2xl font-semibold text-white">{category}</h1>
    </div>
    <nav
      class="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 text-sm text-slate-300"
      aria-label="Category sections"
    >
      <a
        href={`/dashboard/${category}/tasks`}
        class={`rounded-xl cursor-pointer px-3.5 py-1.5 font-medium transition ${
          currentSection == "tasks"
            ? "bg-white/20 text-white shadow-inner shadow-black/30"
            : "text-slate-400 hover:text-white"
        }`}
      >Tasks</a>
      <a
        href={`/dashboard/${category}/notes`}
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
