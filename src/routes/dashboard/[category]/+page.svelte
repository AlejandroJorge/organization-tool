<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Modal from "$lib/components/Modal.svelte";
  import type { PageProps } from "./$types";
  import dayjs from "dayjs";

  let { data, params }: PageProps = $props();

  const { category } = $derived(params);
  const { tasks, notes } = $derived(data);

  let taskModalState: {
    isOpen: boolean;
    mode: "create" | "update";
    fields: {
      id: string;
      name: string;
      status: boolean;
      due: Date | null;
      content: string | null;
    };
  } = $state({
    isOpen: false,
    mode: "create",
    fields: {
      id: "",
      name: "",
      status: false,
      due: null,
      content: "",
    },
  });

  let noteModalState: {
    isOpen: boolean;
    mode: "create" | "update";
    fields: {
      id: string;
      name: string;
      content: string | null;
    };
  } = $state({
    isOpen: false,
    mode: "create",
    fields: {
      id: "",
      name: "",
      content: "",
    },
  });

  async function updateTaskStatus(id: string, value: boolean) {
    await fetch("/api/update-task-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value }),
    });

    invalidateAll();
  }

  async function deleteTask(id: string) {
    await fetch("/api/delete-task", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    invalidateAll();

    taskModalState.isOpen = false;
  }

  async function deleteNote(id: string) {
    await fetch("/api/delete-note", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    invalidateAll();

    noteModalState.isOpen = false;
  }

  const taskActions = {
    create: "?/createTask",
    update: "?/updateTask",
  } as const;

  const noteActions = {
    create: "?/createNote",
    update: "?/updateNote",
  } as const;
</script>

<h1 class="text-center text-xl font-bold">{category.toUpperCase()}</h1>

<h2 class="w-full flex justify-between items-center my-4">
  <span class="font-bold text-xl">Tasks</span>
  <button
    onclick={() => {
      taskModalState.mode = "create";

      taskModalState.fields.id = "";
      taskModalState.fields.name = "";
      taskModalState.fields.due = null;
      taskModalState.fields.status = false;
      taskModalState.fields.content = "";

      taskModalState.isOpen = true;
    }}
    type="button"
    class="rounded-2xl text-white p-2 px-4 border-black border-2 text-sm cursor-pointer"
    >Add</button
  >
</h2>
<ul class="flex flex-col gap-2 overflow-scroll flex-1">
  {#each tasks as task}
    <li
      class="w-full bg-gray-300 p-2 rounded-xl group cursor-pointer text-left flex gap-2 items-center"
    >
      <div>
        <input
          id={task.id}
          onchange={(e) => updateTaskStatus(task.id, e.target?.checked)}
          type="checkbox"
          checked={task.status}
          class="rounded-full"
        />
      </div>
      <button
        class="text-left w-full cursor-pointer"
        onclick={() => {
          taskModalState.mode = "update";

          taskModalState.fields.id = task.id;
          taskModalState.fields.status = task.status;
          taskModalState.fields.name = task.name;
          taskModalState.fields.due = task.due;
          taskModalState.fields.content = task.content;

          taskModalState.isOpen = true;
        }}
      >
        <p class="flex items-center gap-2 justify-between">
          <span class="font-bold">
            {task.name}
          </span>
          {#if task.due}
            <span class="text-sm">{task.due.toDateString()}</span>
          {/if}
        </p>
        <p class="line-clamp-2 text-sm">{task.content}</p>
      </button>
    </li>
  {/each}
</ul>

<h2 class="w-full flex justify-between items-center my-4">
  <span class="font-bold text-xl">Notes</span>
  <button
    onclick={() => {
      noteModalState.mode = "create";

      noteModalState.fields.id = "";
      noteModalState.fields.name = "";
      noteModalState.fields.content = "";

      noteModalState.isOpen = true;
    }}
    type="button"
    class="rounded-2xl text-white p-2 px-4 border-black border-2 text-sm cursor-pointer"
    >Add</button
  >
</h2>
<ul class="w-full justify-between gap-4 flex flex-wrap flex-1 overflow-scroll">
  {#each notes as note}
    <li
      class="text-left min-w-70 w-80 bg-amber-300 p-2 rounded-xl overflow-clip flex-1 cursor-pointer"
      onclick={() => {
        noteModalState.mode = "update";

        noteModalState.fields.id = note.id;
        noteModalState.fields.name = note.name;
        noteModalState.fields.content = note.content;

        noteModalState.isOpen = true;
      }}
    >
      <h4 class="font-bold mb-2">
        {note.name}
      </h4>
      <p class="line-clamp-4 text-sm">{note.content}</p>
    </li>
  {/each}
</ul>

<Modal bind:isOpen={taskModalState.isOpen}>
  <form
    method="POST"
    action={taskActions[taskModalState.mode]}
    class="flex flex-col gap-4 w-[70vw] min-w-120 max-w-240"
  >
    <div class="flex gap-4">
      <input hidden type="text" name="id" value={taskModalState.fields.id} />
      <div class="flex flex-col gap-2">
        <label for="status">Status</label>
        <input
          bind:checked={taskModalState.fields.status}
          class="flex-1 w-full rounded-full"
          name="status"
          type="checkbox"
        />
      </div>
      <div class="flex flex-col gap-2 w-full">
        <label for="name">Task name</label>
        <input
          bind:value={taskModalState.fields.name}
          name="name"
          type="text"
        />
      </div>
      {#if taskModalState.mode == "update"}
        <button
          type="button"
          onclick={() => deleteTask(taskModalState.fields.id)}>DELETE</button
        >
      {/if}
    </div>
    <div class="flex w-full flex-col gap-2">
      <label for="due">Due date</label>
      <input
        bind:value={
          () => dayjs(taskModalState.fields.due).format("YYYY-MM-DD"),
          (v) => (taskModalState.fields.due = dayjs(v, "YYYY-MM-DD").toDate())
        }
        name="due"
        type="date"
      />
    </div>
    <div class="flex w-full flex-col gap-2">
      <label for="content">Content</label>
      <textarea
        bind:value={taskModalState.fields.content}
        name="content"
        class="min-h-20 h-[20vh] resize-none"
      ></textarea>
    </div>
    <div class="flex justify-center gap-8">
      <button type="submit"
        >{taskModalState.mode[0].toUpperCase() +
          taskModalState.mode.substring(1)}</button
      >
      <button onclick={() => (taskModalState.isOpen = false)} type="button"
        >Cancel</button
      >
    </div>
  </form>
</Modal>

<Modal bind:isOpen={noteModalState.isOpen}>
  <form
    method="POST"
    action={noteActions[noteModalState.mode]}
    class="flex flex-col gap-4 w-[70vw] min-w-120 max-w-240"
  >
    <input hidden type="text" name="id" value={noteModalState.fields.id} />
    <div class="flex gap-4">
      <div class="flex gap-4 items-center w-full">
        <div class="flex flex-col gap-2 w-full">
          <label for="name">Note name</label>
          <input
            bind:value={noteModalState.fields.name}
            name="name"
            type="text"
          />
        </div>
        {#if noteModalState.mode == "update"}
          <button
            type="button"
            onclick={() => deleteNote(noteModalState.fields.id)}>DELETE</button
          >
        {/if}
      </div>
    </div>
    <div class="flex w-full flex-col gap-2">
      <label for="content">Content</label>
      <textarea
        bind:value={noteModalState.fields.content}
        name="content"
        class="min-h-20 h-[30vh] max-h-[40vh] resize-none"
      ></textarea>
    </div>
    <div class="flex justify-center gap-8">
      <button type="submit"
        >{noteModalState.mode[0].toUpperCase() +
          noteModalState.mode.substring(1)}</button
      >
      <button onclick={() => (noteModalState.isOpen = false)} type="button"
        >Cancel</button
      >
    </div>
  </form>
</Modal>
