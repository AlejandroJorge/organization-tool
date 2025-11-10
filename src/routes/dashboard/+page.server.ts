import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { db } from "$lib/server/db"
import { categories, notes, tasks } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

export const actions = {
  createCategory: async ({ request }) => {
    const data = await request.formData()
    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true, message: "Category name is required" })

    await db.insert(categories).values({ name })

    return { success: true, message: "Category created" }
  },
  deleteCategory: async ({ request }) => {
    const data = await request.formData()
    const id = data.get("id") as string
    if (!id)
      return fail(400, { id, missing: true, message: "Category id is required" })

    const tasksQuery = await db.select().from(tasks).limit(1).where(eq(tasks.categoryId, id))
    if (tasksQuery.length > 0)
      return fail(400, { id, message: "Remove tasks from this category before deleting it" })

    const notesQuery = await db.select().from(notes).limit(1).where(eq(notes.categoryId, id))
    if (notesQuery.length > 0)
      return fail(400, { id, message: "Remove notes from this category before deleting it" })

    await db.delete(categories).where(eq(categories.id, id))

    return { success: true, message: "Category deleted" }
  }
} satisfies Actions
