import { getDb} from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { asc, eq } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId)
    return { categories: [] };

  const queryCategories = await getDb()
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name));

  return {
    categories: queryCategories
  };
};
