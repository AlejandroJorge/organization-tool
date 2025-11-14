import { redirect, fail, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

const resolveCategory = async (userId: string, categoryId: string) => {
  const [record] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!record)
    error(404, "Category not found");

  return record;
};

export const load: PageServerLoad = async ({ params, locals }) => {
  const userId = locals.user?.id;
  if (!userId)
    throw error(401, "Unauthorized");

  await resolveCategory(userId, params.category);
  throw redirect(307, `/dashboard/${params.category}/tasks`);
};

export const actions = {
  renameCategory: async ({ request, params, locals }) => {
    const userId = locals.user?.id;
    if (!userId)
      return fail(401, { message: "Unauthorized" });

    const data = await request.formData();
    const nameInput = (data.get("name") as string | null)?.trim();

    if (!nameInput)
      return fail(400, { message: "Category name is required" });

    const category = await resolveCategory(userId, params.category);
    if (nameInput === category.name)
      return { success: true, message: "Category name updated" };

    const [duplicate] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.name, nameInput), eq(categories.userId, userId)))
      .limit(1);

    if (duplicate && duplicate.id !== category.id)
      return fail(400, { message: "That name is already in use" });

    try {
      await db.update(categories).set({ name: nameInput }).where(eq(categories.id, category.id));
    } catch (err) {
      console.error("[categories] renameCategory", err);
      return fail(500, { message: "Unable to rename category" });
    }

    return { success: true, message: "Category renamed" };
  }
} satisfies Actions;
