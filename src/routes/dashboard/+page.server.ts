import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { categories, tasks, notes } from "$lib/server/db/schema";
import { and, asc, eq, or, isNull, like, lt, sql } from "drizzle-orm";

const loadTasks = async ({ q, onlyTodo, interval }: { q?: string; onlyTodo?: boolean; interval?: number }) => {
  const whereClause = and(
    q ? like(tasks.name, `%${q}%`) : undefined,
    onlyTodo ? eq(tasks.status, false) : undefined,
    interval ? or(lt(tasks.due, new Date(Date.now() + interval * 24 * 60 * 60 * 1000)), isNull(tasks.due)) : undefined
  );

  return db
    .select()
    .from(tasks)
    .where(whereClause)
    .orderBy(asc(tasks.status), sql`CASE WHEN ${tasks.due} IS NULL THEN 1 ELSE 0 END`, asc(tasks.due));
};

export const load: PageServerLoad = async ({ url }) => {
  const q = url.searchParams.get("q") ?? "";
  const onlyTodo = url.searchParams.get("onlyTodo") === "true";
  const rawInterval = url.searchParams.get("interval");
  const parsedInterval = rawInterval ? Number(rawInterval) : undefined;
  const interval =
    typeof parsedInterval === "number" && Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : undefined;

  const [queryTasks, queryCategories] = await Promise.all([
    loadTasks({ q, onlyTodo, interval }),
    db.select().from(categories).orderBy(asc(categories.name))
  ]);

  return {
    tasks: queryTasks,
    categories: queryCategories,
    filters: { q, onlyTodo, interval }
  };
};

export const actions = {
  createCategory: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name") as string;
    if (!name)
      return fail(400, { name, missing: true, message: "Category name is required" });

    await db.insert(categories).values({ name });

    return { success: true, message: "Category created" };
  },
  deleteCategory: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id") as string;
    if (!id)
      return fail(400, { id, missing: true, message: "Category id is required" });

    const tasksQuery = await db.select().from(tasks).limit(1).where(eq(tasks.categoryId, id));
    if (tasksQuery.length > 0)
      return fail(400, { id, message: "Remove tasks from this category before deleting it" });

    const notesQuery = await db.select().from(notes).limit(1).where(eq(notes.categoryId, id));
    if (notesQuery.length > 0)
      return fail(400, { id, message: "Remove notes from this category before deleting it" });

    await db.delete(categories).where(eq(categories.id, id));

    return { success: true, message: "Category deleted" };
  }
} satisfies Actions;
