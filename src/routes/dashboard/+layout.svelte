<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
  const { categories } = data;

  let isDeleteCategoryModalOpen = $state(false);
  let deleteCategoryId = $state("");
</script>

<div class="w-full min-h-[100vh] flex bg-pink-600">
  <div
    class="w-[12%] min-w-[12rem] max-w-[20rem] p-4 bg-amber-400 flex flex-col justify-between"
  >
    <ul>
      {#each categories as category}
        <li class="group flex justify-between">
          <a href={`/dashboard/${category.name}`}>{category.name}</a>
          <button
            onclick={() => {
              isDeleteCategoryModalOpen = true;
              deleteCategoryId = category.id;
            }}
            class="hidden group-hover:inline cursor-pointer">&times;</button
          >
        </li>
      {/each}
    </ul>
    <form
      class="flex justify-between gap-2"
      action="/dashboard?/createCategory"
      method="POST"
    >
      <input class="w-full" name="name" type="text" />
      <button class="bg-gray-800 rounded-xl w-10 h-full">&plus;</button>
    </form>
  </div>
  <div class="p-4 w-full max-h-[100vh] bg-red-500 flex flex-col">
    {@render children()}
  </div>
</div>

<Modal bind:isOpen={isDeleteCategoryModalOpen}>
  <form action="/dashboard?/deleteCategory" method="POST" class="flex flex-col gap-4">
    <input hidden type="text" name="id" value={deleteCategoryId} />
    <p>Are you sure you want to delete this category</p>
    <div class="flex w-full justify-center gap-8">
      <button class="cursor-pointer" type="submit">Confirm</button>
      <button
        class="cursor-pointer"
        type="button"
        onclick={() => {
          isDeleteCategoryModalOpen = false;
          deleteCategoryId = "";
        }}>Cancel</button
      >
    </div>
  </form>
</Modal>
