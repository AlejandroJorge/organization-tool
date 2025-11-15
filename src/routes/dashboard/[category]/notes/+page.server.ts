import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getDb } from "$lib/server/db";
import { categories, notes } from "$lib/server/db/schema";
import { and, asc, desc, eq, like } from "drizzle-orm";

const resolveCategory = async (userId: string, categoryId: string) => {
  const [record] = await getDb()
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!record) error(404, "Category not found");
  return record;
};

const loadNotes = async (userId: string, categoryId: string, search?: string) => {
  const whereClause = and(
    eq(notes.userId, userId),
    eq(notes.categoryId, categoryId),
    search ? like(notes.name, `%${search}%`) : undefined
  );

  return getDb()
    .select()
    .from(notes)
    .where(whereClause)
    .orderBy(asc(notes.position), asc(notes.name));
};

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const userId = locals.user?.id;
  if (!userId)
    throw error(401, "Unauthorized");

  const category = await resolveCategory(userId, params.category);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const queryNotes = await loadNotes(userId, category.id, q || undefined);

  return {
    category,
    notes: queryNotes,
    filters: { q }
  };
};

export const actions = {
  createNote: async ({ request, params, locals }) => {
    const userId = locals.user?.id;
    if (!userId)
      return fail(401, { message: "Unauthorized" });

    const data = await request.formData();
    const name = data.get("name") as string;
    if (!name) return fail(400, { name, missing: true, message: "Note title is required" });

    const content = data.get("content") as string;
    if (!content) return fail(400, { content, missing: true, message: "Note content is required" });

    const { id: categoryId } = await resolveCategory(userId, params.category);

    try {
      const [lastNote] = await getDb()
        .select({ position: notes.position })
        .from(notes)
        .where(and(eq(notes.categoryId, categoryId), eq(notes.userId, userId)))
        .orderBy(desc(notes.position))
        .limit(1);

      const nextPosition = (lastNote?.position ?? -1) + 1;

      await getDb().insert(notes).values({ name, content, categoryId, position: nextPosition, userId });
      console.info("[notes] create", {
        categoryId,
        noteName: name,
        assignedPosition: nextPosition,
      });
    } catch (err) {
      console.error("[notes] createNote", err);
      return fail(500, { message: "Unable to create note" });
    }

    return { success: true };
  },
  updateNote: async ({ request, locals }) => {
    const userId = locals.user?.id;
    if (!userId)
      return fail(401, { message: "Unauthorized" });

    const data = await request.formData();

    const id = data.get("id") as string;
    if (!id) return fail(400, { id, missing: true, message: "Note id is required" });

    const name = data.get("name") as string;
    if (!name) return fail(400, { name, missing: true, message: "Note title is required" });

    const content = data.get("content") as string;

    const [noteRecord] = await getDb()
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .limit(1);
    if (!noteRecord)
      return fail(404, { message: "Note not found" });

    try {
      await getDb()
        .update(notes)
        .set({ name, content })
        .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    } catch (err) {
      console.error("[notes] updateNote", err);
      return fail(500, { message: "Unable to update note" });
    }

    return { success: true };
  }
} satisfies Actions;
