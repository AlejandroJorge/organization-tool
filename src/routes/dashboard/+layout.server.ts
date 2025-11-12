import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { asc } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const queryCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.name));

  return {
    categories: queryCategories,
  };
};
