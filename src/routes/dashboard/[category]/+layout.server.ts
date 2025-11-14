import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

const resolveCategory = async (userId: string, categoryId: string) => {
  const [categoryRecord] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!categoryRecord)
    error(404, "Category not found");

  return categoryRecord;
};

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const userId = locals.user?.id;
  if (!userId)
    throw error(401, "Unauthorized");

  const categoryRecord = await resolveCategory(userId, params.category);

  return {
    category: categoryRecord
  };
};
