<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import CheckToggle from "$lib/components/CheckToggle.svelte";
  import type { PageProps } from "./$types";
  import dayjs from "$lib/dayjs";

  let { data }: PageProps = $props();

  type Task = (typeof data.tasks)[number];
  const tasks = $derived(data.tasks);
  const categories = $derived(data.categories);
  const filters = $state({
    searchQuery: data.filters?.q ?? "",
    showOnlyTodo: data.filters?.onlyTodo ?? false,
    intervalValue: data.filters?.interval ? String(data.filters.interval) : "",
  });

  const intervalOptions = [
    { label: "Today", value: "1" },
    { label: "Next 3 days", value: "3" },
    { label: "Next week", value: "7" },
    { label: "Next 2 weeks", value: "14" },
    { label: "Next month", value: "30" },
  ] as const;

  async function reloadData() {
    const url = new URL(page.url);
    if (filters.searchQuery) url.searchParams.set("q", filters.searchQuery);
    else url.searchParams.delete("q");

    if (filters.showOnlyTodo) url.searchParams.set("onlyTodo", "true");
    else url.searchParams.delete("onlyTodo");

    if (filters.intervalValue) url.searchParams.set("interval", filters.intervalValue);
    else url.searchParams.delete("interval");

    await goto(url.toString(), { keepFocus: true, noScroll: true });
  }

  function formatDueDate(task: Task) {
    return task.due ? dayjs.utc(task.due).format("ddd D MMM") : null;
  }

  function categoryNameFor(task: Task) {
    return categories.find((category) => category.id === task.categoryId)?.name ?? "Unknown";
  }
</script>

<section class="space-y-6">
  <header class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500">Global view</p>
      <h1 class="text-2xl font-semibold text-white flex items-center gap-3">
        All tasks
        <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] text-slate-400">
          {tasks.length}
        </span>
      </h1>
    </div>
    <p class="text-xs text-slate-500 uppercase tracking-[0.3em]">Read only · open any category to edit</p>
  </header>

  <form
    method="GET"
    class="grid gap-3 rounded-2xl border border-white/5 bg-[#080b14] p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)]"
  >
    <label class="flex flex-col gap-2">
      <span class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Search</span>
      <input
        type="search"
        name="q"
        bind:value={filters.searchQuery}
        oninput={reloadData}
        placeholder="Find tasks"
        class="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
      />
    </label>

    <label class="flex flex-col gap-2">
      <span class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Status</span>
      <span class="flex items-center justify-between rounded-2xl border border-white/10 bg-[#05070f] px-4 py-2 text-sm font-semibold text-slate-200">
        Only open tasks
        <span class="relative inline-flex items-center">
          <input
            type="checkbox"
            name="onlyTodo"
            bind:checked={filters.showOnlyTodo}
            onchange={reloadData}
            class="peer sr-only"
          />
          <span class="block h-6 w-11 rounded-full bg-white/10 transition peer-checked:bg-white/80"></span>
          <span class="absolute left-1 top-1 block h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-[#05060c]"></span>
        </span>
      </span>
    </label>

    <label class="flex flex-col gap-2">
      <span class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Due within</span>
      <select
        name="interval"
        bind:value={filters.intervalValue}
        onchange={reloadData}
        class="rounded-2xl border border-white/10 bg-[#05070f] px-4 py-2.5 text-sm text-slate-100 focus:border-white/30 focus:outline-none"
      >
        <option value="">Any time</option>
        {#each intervalOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>
  </form>

  <ul class="space-y-2.5">
    {#if tasks.length === 0}
      <li class="rounded-2xl border border-dashed border-white/10 bg-[#080b14]/60 px-4 py-6 text-center text-sm text-slate-500">
        No tasks match these filters.
      </li>
    {:else}
      {#each tasks as task}
        <li class="flex items-start gap-4 rounded-2xl border border-white/5 bg-[#0b0f1c] px-4 py-4">
          <CheckToggle
            checked={task.status}
            label={`Mark ${task.name} as ${task.status ? "pending" : "done"}`}
            disabled
          />
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class={`text-base font-semibold ${task.status ? "text-slate-500 line-through" : "text-white"}`}>
                {task.name}
              </h3>
              <a
                class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] text-slate-400 hover:text-white hover:border-white/30"
                href={`/dashboard/${task.categoryId}/tasks`}
              >
                {categoryNameFor(task)}
              </a>
              {#if formatDueDate(task)}
                <span class="ml-auto text-xs font-semibold text-slate-300">
                  {formatDueDate(task)}
                </span>
              {/if}
            </div>
            <p class="mt-1 line-clamp-2 text-sm text-slate-400">
              {task.content ?? "No details captured yet."}
            </p>
          </div>
        </li>
      {/each}
    {/if}
  </ul>
</section>
