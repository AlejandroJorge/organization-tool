<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import Modal from "$lib/components/Modal.svelte";
  import MDInput from "$lib/components/MDInput.svelte";
  import TaskList from "$lib/components/TaskList.svelte";
  import dayjs from "$lib/dayjs";
  import { fetchWithErrorToast, createErrorToastEnhancer } from "$lib/utils/toast-errors";
  import type { PageProps } from "./$types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getContext } from "svelte";
  import { WORKSPACE_TIMEZONE_CONTEXT } from "$lib/context/workspace-timezone";

  let { data }: PageProps = $props();

  const { tasks } = $derived(data);
  const pagination = $derived(data.pagination);
  const workspaceTimezone = getContext<string>(WORKSPACE_TIMEZONE_CONTEXT) ?? "UTC";
  type Task = (typeof data.tasks)[number];
  const filters = $state({
    searchQuery: data.filters?.q ?? "",
    showOnlyTodo: data.filters?.onlyTodo ?? false,
    intervalValue: data.filters?.interval ? String(data.filters.interval) : "",
  });
  let taskInitialContent = $state("");
  let taskDiscardModalOpen = $state(false);

  const intervalOptions = [
    { label: "Today", value: "1" },
    { label: "Next 3 days", value: "3" },
    { label: "Next week", value: "7" },
    { label: "Next 2 weeks", value: "14" },
    { label: "Next month", value: "30" },
  ] as const;
  const previewToggleId = "task-preview-toggle";
  const recurrenceOptions = [
    { label: "Does not repeat", value: "" },
    { label: "Daily", value: "daily" },
    { label: "Weekdays", value: "workday" },
  ] as const;

  let taskModalState: {
    isOpen: boolean;
    mode: "create" | "update";
    isPreview: boolean;
    fields: {
      id: string;
      name: string;
      status: boolean;
      due: Date | null;
      content: string | null;
      recurrence: "" | "daily" | "workday";
    };
  } = $state({
    isOpen: false,
    mode: "create",
    isPreview: false,
    fields: {
      id: "",
      name: "",
      status: false,
      due: null,
      content: "",
      recurrence: "",
    },
  });

  const serializedDueValue = $derived(
    taskModalState.fields.due
      ? dayjs.utc(taskModalState.fields.due).second(0).millisecond(0).toISOString()
      : ""
  );

  async function updateTaskStatus(id: string, value: boolean) {
    const response = await fetchWithErrorToast(
      "/api/update-task-status",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value }),
      },
      "Unable to update task"
    );

    if (!response)
      return;

    invalidateAll();
  }

  async function deleteTask(id: string) {
    const response = await fetchWithErrorToast(
      "/api/delete-task",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      },
      "Unable to delete task"
    );

    if (!response)
      return;

    invalidateAll();

    taskModalState.isOpen = false;
  }

  async function rescheduleTask(id: string) {
    const response = await fetchWithErrorToast(
      "/api/reschedule-task",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      },
      "Unable to reschedule task"
    );

    if (!response)
      return;

    invalidateAll();
  }

  function applyFiltersToUrl(url: URL) {
    if (filters.searchQuery) url.searchParams.set("q", filters.searchQuery);
    else url.searchParams.delete("q");

    if (filters.showOnlyTodo) url.searchParams.set("onlyTodo", "true");
    else url.searchParams.delete("onlyTodo");

    if (filters.intervalValue)
      url.searchParams.set("interval", filters.intervalValue);
    else url.searchParams.delete("interval");
  }

  async function reloadData() {
    const url = new URL(page.url);
    applyFiltersToUrl(url);
    url.searchParams.delete("page");
    await goto(url.toString(), { keepFocus: true, noScroll: true });
  }

  async function changePage(nextPage: number) {
    if (!pagination)
      return;
    const clamped = Math.min(Math.max(1, nextPage), pagination.totalPages);
    if (clamped === pagination.page)
      return;
    const url = new URL(page.url);
    applyFiltersToUrl(url);
    url.searchParams.set("page", String(clamped));
    await goto(url.toString(), { keepFocus: true, noScroll: true });
  }

  const taskActions = {
    create: "?/createTask",
    update: "?/updateTask",
  } as const;

  function openCreateTaskModal() {
    taskModalState.mode = "create";
    taskModalState.isPreview = false;
    taskModalState.fields.id = "";
    taskModalState.fields.name = "";
    taskModalState.fields.due = dayjs().tz(workspaceTimezone).startOf("day").toDate();
    taskModalState.fields.status = false;
    taskModalState.fields.content = "";
    taskModalState.fields.recurrence = "";
    taskModalState.isOpen = true;
    taskInitialContent = "";
  }

  function openUpdateTaskModal(task: Task) {
    taskModalState.mode = "update";
    taskModalState.isPreview = true;
    taskModalState.fields.id = task.id;
    taskModalState.fields.status = task.status;
    taskModalState.fields.name = task.name;
    taskModalState.fields.due = task.due;
    taskModalState.fields.content = task.content;
    taskModalState.fields.recurrence = (task.recurrence as "daily" | "workday" | null) ?? "";
    taskModalState.isOpen = true;
    taskInitialContent = task.content ?? "";
  }

  function hasTaskContentChanges() {
    return (taskModalState.fields.content ?? "") !== taskInitialContent;
  }

  function handleTaskModalCloseRequest() {
    if (hasTaskContentChanges()) {
      taskDiscardModalOpen = true;
      return false;
    }
    return true;
  }

  function onTaskCancel() {
    if (handleTaskModalCloseRequest())
      taskModalState.isOpen = false;
  }

  function keepEditingTask() {
    taskDiscardModalOpen = false;
  }

  function discardTaskChanges() {
    taskDiscardModalOpen = false;
    taskModalState.isOpen = false;
    taskModalState.fields.content = taskInitialContent;
  }

  const handleTaskFormResult = createErrorToastEnhancer({
    onSuccess: () => {
      taskModalState.isOpen = false;
      taskDiscardModalOpen = false;
    }
  });

  function applyDateSelection(value: string) {
    if (!value) {
      taskModalState.fields.due = null;
      return;
    }
    const existing = taskModalState.fields.due
      ? dayjs(taskModalState.fields.due).tz(workspaceTimezone)
      : dayjs.tz(`${value}T00:00`, workspaceTimezone);
    const next = dayjs
      .tz(`${value}T00:00`, workspaceTimezone)
      .hour(existing.hour())
      .minute(existing.minute())
      .second(0)
      .millisecond(0);
    taskModalState.fields.due = next.toDate();
  }

  function applyHourSelection(value: string) {
    if (!taskModalState.fields.due) return;
    if (!value) {
      const reset = dayjs(taskModalState.fields.due).tz(workspaceTimezone).hour(0).minute(0).second(0).millisecond(0);
      taskModalState.fields.due = reset.toDate();
      return;
    }
    const [hourPart, minutePart = "00"] = value.split(":");
    const hour = Number.parseInt(hourPart, 10);
    const minute = Number.parseInt(minutePart, 10) || 0;
    if (Number.isNaN(hour) || hour < 0 || hour > 23) return;
    const updated = dayjs(taskModalState.fields.due)
      .tz(workspaceTimezone)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);
    taskModalState.fields.due = updated.toDate();
  }
</script>

<section class="flex min-h-0 flex-col space-y-4">
  <header class="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold text-white tracking-tight">Tasks</h2>
      <span class="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.35em]">
        {tasks.length}
      </span>
    </div>
    <button
      onclick={openCreateTaskModal}
      type="button"
      class="rounded-xl bg-[var(--brand,#f1b24a)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#05060c] transition hover:brightness-110 cursor-pointer"
    >
      New Task
    </button>
  </header>

  <form method="GET" class="rounded-2xl border border-white/10 bg-[#06080f] p-4">
    <div class="flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        bind:value={filters.searchQuery}
        oninput={reloadData}
        placeholder="Search tasks"
        class="w-full flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-white/40 focus:outline-none md:w-auto"
      />
      <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        <input
          type="checkbox"
          name="onlyTodo"
          bind:checked={filters.showOnlyTodo}
          onchange={reloadData}
          class="h-4 w-4 rounded border border-white/30 bg-transparent text-white focus:ring-0"
        />
        Only open
      </label>
      <select
        name="interval"
        bind:value={filters.intervalValue}
        onchange={reloadData}
        class="min-w-[180px] rounded-xl border border-white/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 focus:border-white/40"
      >
        <option value="">Any time</option>
        {#each intervalOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </form>

  <div class="flex-1 min-h-0 overflow-y-auto pr-1">
    <TaskList
      tasks={tasks}
      emptyMessage="No tasks yet. Add your first one."
      onToggle={(task, nextValue) => updateTaskStatus(task.id, nextValue)}
      onSelect={openUpdateTaskModal}
      onReschedule={(task) => rescheduleTask(task.id)}
    />
  </div>

  {#if pagination && pagination.totalPages > 1}
    <nav class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#06080f] px-4 py-3 text-xs text-slate-300">
      <button
        type="button"
        class="inline-flex items-center rounded-xl border border-white/15 px-3 py-1 font-semibold uppercase tracking-[0.35em] transition hover:border-white/30 disabled:opacity-50 disabled:hover:border-white/15"
        onclick={() => changePage(pagination.page - 1)}
        disabled={pagination.page <= 1}
      >
        Previous
      </button>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} tasks
      </p>
      <button
        type="button"
        class="inline-flex items-center rounded-xl border border-white/15 px-3 py-1 font-semibold uppercase tracking-[0.35em] transition hover:border-white/30 disabled:opacity-50 disabled:hover:border-white/15"
        onclick={() => changePage(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
      >
        Next
      </button>
    </nav>
  {/if}
</section>

<Modal bind:isOpen={taskModalState.isOpen} onCloseRequest={handleTaskModalCloseRequest}>
  <form
    method="POST"
    action={taskActions[taskModalState.mode]}
    class="flex w-full flex-col gap-5"
    use:enhance={handleTaskFormResult}
  >
    <input hidden type="text" name="id" value={taskModalState.fields.id} />
    <div class="space-y-1">
      <p class="text-[10px] uppercase tracking-[0.45em] text-slate-500">
        {taskModalState.mode} task
      </p>
      <h3 class="text-xl font-semibold text-white">
        {taskModalState.mode === "create" ? "New task" : "Update task"}
      </h3>
    </div>
  <div class="space-y-4">
    <div class="flex flex-col gap-2">
      <label
        for="name"
        class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500"
        >Task name</label
      >
      <input
        bind:value={taskModalState.fields.name}
        name="name"
        type="text"
        required
        placeholder="Ship onboarding flow"
        class="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
      />
    </div>
    <div class="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))]">
      <div class="flex flex-col gap-2">
        <label
          for="due-date"
          class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500"
          >Due date</label
        >
        <input
          id="due-date"
        bind:value={
          () =>
            taskModalState.fields.due
              ? dayjs(taskModalState.fields.due).tz(workspaceTimezone).format("YYYY-MM-DD")
              : "",
          (v) => applyDateSelection(v)
        }
          type="date"
          class="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label
          for="due-hour"
          class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500"
          >Due hour</label
        >
        <input
          id="due-hour"
          type="time"
          step="3600"
        bind:value={
          () =>
            taskModalState.fields.due
              ? dayjs(taskModalState.fields.due).tz(workspaceTimezone).format("HH:mm")
              : "",
          (v) => applyHourSelection(v)
        }
          class="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none disabled:opacity-30"
          disabled={!taskModalState.fields.due}
        />
      </div>
      <div class="flex flex-col gap-2">
        <label
          for="recurrence"
          class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500"
          >Repeats</label
        >
        <select
          id="recurrence"
          name="recurrence"
          bind:value={taskModalState.fields.recurrence}
          class="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
        >
          {#each recurrenceOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
    <input type="hidden" name="due" value={serializedDueValue} />
    <div class="flex w-full flex-col gap-2">
      <div class="flex items-center justify-between gap-3">
        <label
          for="content"
          class="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500"
          >Details</label
        >
        <label
          for={previewToggleId}
          class="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400"
        >
          Preview
          <span class="relative inline-flex items-center">
            <input
              id={previewToggleId}
              type="checkbox"
              bind:checked={taskModalState.isPreview}
              class="peer sr-only"
            />
            <span class="block h-4 w-8 rounded-full border border-white/15 bg-white/10 transition peer-checked:border-white/50 peer-checked:bg-white/70"></span>
            <span class="absolute left-0.5 top-0.5 block h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-3.5 peer-checked:bg-[#05060c]"></span>
          </span>
        </label>
      </div>
      <MDInput
        isPreview={taskModalState.isPreview}
        bind:value={taskModalState.fields.content}
        name="content"
        placeholder="Add context, links, or checklists..."
        class="min-h-[30vh] h-[45vh] max-h-[65vh] rounded-xl border border-white/15 bg-transparent p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none {taskModalState.isPreview ? 'overflow-y-scroll' : ''}"
      ></MDInput>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      {#if taskModalState.mode == "update"}
        <button
          type="button"
          class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300/80 hover:text-rose-100 cursor-pointer"
          onclick={() => deleteTask(taskModalState.fields.id)}
        >
          Delete task
        </button>
      {/if}
      <div class="ml-auto flex gap-3">
        <button
          onclick={onTaskCancel}
          type="button"
          class="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-xl bg-[var(--brand,#f1b24a)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#05060c] transition hover:brightness-110 cursor-pointer"
        >
          {taskModalState.mode === "create" ? "Create" : "Save"}
        </button>
      </div>
    </div>
  </form>
</Modal>

<Modal bind:isOpen={taskDiscardModalOpen}>
  <div class="flex flex-col gap-4">
    <div class="space-y-1">
      <p class="text-[10px] uppercase tracking-[0.45em] text-slate-500">Discard changes</p>
      <h3 class="text-lg font-semibold text-white">Leave without saving?</h3>
      <p class="text-sm text-slate-400">You have unsaved task details. Discarding will remove those edits.</p>
    </div>
    <div class="ml-auto flex gap-3">
      <button
        type="button"
        class="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 cursor-pointer"
        onclick={keepEditingTask}
      >
        Keep editing
      </button>
      <button
        type="button"
        class="rounded-xl bg-rose-400/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#05060c] transition hover:brightness-110 cursor-pointer"
        onclick={discardTaskChanges}
      >
        Discard changes
      </button>
    </div>
  </div>
</Modal>
