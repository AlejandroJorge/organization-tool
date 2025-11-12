import { redirect, fail, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const resolveCategory = async (categoryId: string) => {
  const [record] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!record)
    error(404, "Category not found");

  return record;
};

export const load: PageServerLoad = async ({ params }) => {
  throw redirect(307, `/dashboard/${params.category}/tasks`);
};

export const actions = {
  renameCategory: async ({ request, params }) => {
    const data = await request.formData();
    const nameInput = (data.get("name") as string | null)?.trim();

    if (!nameInput)
      return fail(400, { message: "Category name is required" });

    const category = await resolveCategory(params.category);
    if (nameInput === category.name)
      return { success: true, message: "Category name updated" };

    const [duplicate] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, nameInput))
      .limit(1);

    if (duplicate && duplicate.id !== category.id)
      return fail(400, { message: "That name is already in use" });

    await db.update(categories).set({ name: nameInput }).where(eq(categories.id, category.id));

    return { success: true, message: "Category renamed" };
  }
} satisfies Actions;
