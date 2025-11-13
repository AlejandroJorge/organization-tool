<script lang="ts">
  import dayjs from "$lib/dayjs";
  import CheckToggle from "$lib/components/CheckToggle.svelte";
  import { getContext } from "svelte";
  import { WORKSPACE_TIMEZONE_CONTEXT } from "$lib/context/workspace-timezone";

  type Task = {
    id: string;
    name: string;
    content: string | null;
    status: boolean;
    due: Date | null;
    categoryId: string;
    recurrence: "daily" | "workday" | null;
  };

  let {
    tasks,
    readOnly = false,
    showCategoryBadge = false,
    categoryLookup = {},
    emptyMessage = "No tasks yet.",
    onToggle,
    onSelect,
    onReschedule,
  }: {
    tasks: Task[];
    readOnly?: boolean;
    showCategoryBadge?: boolean;
    categoryLookup?: Record<string, string>;
    emptyMessage?: string;
    onToggle?: (task: Task, nextValue: boolean) => void | Promise<void>;
    onSelect?: (task: Task) => void | Promise<void>;
    onReschedule?: (task: Task) => void | Promise<void>;
  } = $props();

  const workspaceTimezone = getContext<string>(WORKSPACE_TIMEZONE_CONTEXT) ?? "UTC";

  function hasDueTime(due: Task["due"]) {
    if (!due)
      return false;
    const parsed = dayjs(due).tz(workspaceTimezone);
    return parsed.hour() !== 0 || parsed.minute() !== 0;
  }

  function formatDue(due: Task["due"]) {
    if (!due)
      return null;
    const parsed = dayjs(due).tz(workspaceTimezone);
    const dateLabel = parsed.format("dddd D, MMM YYYY");
    return hasDueTime(due) ? `${dateLabel} · ${parsed.format("HH:mm")}` : dateLabel;
  }

  function isOverdue(task: Task) {
    if (!task.due || task.status)
      return false;
    const due = dayjs(task.due).tz(workspaceTimezone);
    const now = dayjs().tz(workspaceTimezone);
    return due.isBefore(now);
  }

  function isRecurring(task: Task) {
    return task.recurrence === "daily" || task.recurrence === "workday";
  }

  function recurrenceLabel(task: Task) {
    if (task.recurrence === "daily") return "Repeats daily";
    if (task.recurrence === "workday") return "Repeats on weekdays";
    return null;
  }

  function handleReschedule(task: Task) {
    if (!onReschedule)
      return;
    onReschedule(task);
  }

  function handleToggle(task: Task) {
    if (readOnly || !onToggle)
      return;
    const nextValue = !task.status;
    void onToggle(task, nextValue);
  }

  function handleSelect(task: Task) {
    if (!onSelect)
      return;
    onSelect(task);
  }
</script>

<ul class="space-y-2.5">
  {#if tasks.length === 0}
    <li
      class="rounded-2xl border border-dashed border-white/10 bg-[#080b14]/60 px-4 py-6 text-center text-sm text-slate-500"
    >
      {emptyMessage}
    </li>
  {:else}
    {#each tasks as task}
      <li
        class={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
          isOverdue(task)
            ? "border-rose-500/60 bg-rose-500/5"
            : "border-white/10 bg-white/5/0"
        }`}
      >
        <CheckToggle
          checked={task.status}
          disabled={readOnly || !onToggle}
          label={`Mark ${task.name} as ${task.status ? "pending" : "done"}`}
          onchange={() => handleToggle(task)}
        />
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            class="min-w-0 flex-1 cursor-pointer text-left"
            onclick={() => handleSelect(task)}
            disabled={!onSelect}
          >
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class={`truncate font-semibold ${task.status ? "text-slate-500 line-through" : "text-slate-50"}`}>
                  {task.name}
                </p>
              {#if isRecurring(task)}
                <span class="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-400">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M10 4v3.5h3" />
                    <path d="M5 5a7 7 0 1 1-2 5" />
                  </svg>
                  {task.recurrence === "daily" ? "Daily" : "Weekdays"}
                </span>
              {/if}
              {#if showCategoryBadge && task.categoryId}
                <a
                  class="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.35em] text-slate-400 hover:border-white/30 hover:text-white"
                  href={`/dashboard/${task.categoryId}/tasks`}
                >
                  {categoryLookup[task.categoryId] ?? "Space"}
                </a>
              {/if}
            </div>
              {#if task.content || (!task.content && !task.status)}
                <p class="line-clamp-1 text-xs text-slate-400">
                  {task.content ?? "No details yet"}
                </p>
              {/if}
              {#if recurrenceLabel(task) || isOverdue(task)}
                <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  {#if recurrenceLabel(task)}
                    <span>{recurrenceLabel(task)}</span>
                  {/if}
                  {#if isOverdue(task)}
                    <span class="text-rose-200">Past due</span>
                  {/if}
                </div>
              {/if}
            </div>
          </button>
          <div class="flex flex-col items-end gap-1 text-xs whitespace-nowrap">
            {#if formatDue(task.due)}
              <span class="text-slate-200">{formatDue(task.due)}</span>
            {/if}
            {#if onReschedule && isOverdue(task) && isRecurring(task)}
              <button
                type="button"
                class="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300 hover:text-white"
                onclick={(event) => {
                  event.stopPropagation();
                  handleReschedule(task);
                }}
              >
                Resched
              </button>
            {/if}
          </div>
        </div>
      </li>
    {/each}
  {/if}
</ul>
