import { db } from "$lib/server/db";
import { asc, eq, sql } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import { categories, notes, tasks } from "$lib/server/db/schema";
import { error, fail } from "@sveltejs/kit";
import dayjs from "dayjs";

const loadTasks = async (categoryId: string) => db.select().from(tasks).where(eq(tasks.categoryId, categoryId)).orderBy(
  asc(tasks.status),
  sql`CASE WHEN ${tasks.due} IS NULL THEN 1 ELSE 0 END`,
  asc(tasks.due))

const loadNotes = async (categoryId: string) => db.select().from(notes).where(eq(notes.categoryId, categoryId))

export const load: PageServerLoad = async ({ params }) => {
  const { category } = params
  const queryRes = await db.select().from(categories).where(eq(categories.name, category)).limit(1)
  if (queryRes.length == 0) error(404, "Category not found")

  const categoryId = queryRes[0].id
  const queryTasks = await loadTasks(categoryId)

  const queryNotes = await loadNotes(categoryId)

  return {
    tasks: queryTasks,
    notes: queryNotes
  }
}

export const actions = {
  createTask: async ({ request, params }) => {
    const data = await request.formData()
    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true })

    const due = dayjs(data.get("due") as string).toDate()
    const content = data.get("content") as string
    const status = data.get("status") ? true : false

    const { category } = params

    const queriedCategory = await db.select().from(categories).where(eq(categories.name, category)).limit(1)
    if (queriedCategory.length == 0)
      error(404, "Category not found")
    const categoryId = queriedCategory[0].id

    await db.insert(tasks).values({
      name, due, content, categoryId, status
    })

    return { success: true }
  },
  updateTask: async ({ request }) => {
    const data = await request.formData()
    
    const id = data.get("id") as string
    if (!id)
      return fail(400, { id, missing: true })

    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true })

    const due = dayjs(data.get("due") as string).toDate()
    const content = data.get("content") as string
    const status = data.get("status") ? true : false

    await db.update(tasks).set({
      name, due, content, status
    }).where(eq(tasks.id, id))

    return { success: true }
  },
  createNote: async ({ request, params }) => {
    const data = await request.formData()
    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true })

    const content = data.get("content") as string
    if (!content)
      return fail(400, { content, missing: true })

    const { category } = params

    const queriedCategory = await db.select().from(categories).where(eq(categories.name, category)).limit(1)
    if (queriedCategory.length == 0)
      error(404, "Category not found")
    const categoryId = queriedCategory[0].id

    await db.insert(notes).values({
      name, content, categoryId
    })

    return { success: true }
  },
  updateNote: async ({ request }) => {
    const data = await request.formData()
    const id = data.get("id") as string
    if (!id)
      return fail(400, { id, missing: true })

    const name = data.get("name") as string
    if (!name)
      return fail(400, { name, missing: true })

    const content = data.get("content") as string

    await db.update(notes).set({
      name, content
    }).where(eq(notes.id, id))

    return { success: true }
  }
} satisfies Actions
