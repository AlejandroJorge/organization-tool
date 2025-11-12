import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

const resolveCategory = async (categoryId: string) => {
  const [categoryRecord] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!categoryRecord)
    error(404, "Category not found");

  return categoryRecord;
};

export const load: LayoutServerLoad = async ({ params }) => {
  const categoryRecord = await resolveCategory(params.category);

  return {
    category: categoryRecord
  };
};
