import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
});

export const categories = sqliteTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
);

export const tasks = sqliteTable(
  "task",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    status: integer("status", { mode: "boolean" }).notNull().default(false),
    due: integer("due", { mode: "timestamp" }),
    content: text("content"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recurrence: text("recurrence", { enum: ["daily", "workday"] }).$type<"daily" | "workday" | null>()
  },
);

export const notes = sqliteTable(
  "note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    content: text("content"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0)
  },
);

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  tasks: many(tasks),
  notes: many(notes)
}));

export const categoryRelations = relations(categories, ({ many, one }) => ({
  tasks: many(tasks),
  notes: many(notes),
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  })
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id]
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  })
}));

export const notesRelations = relations(notes, ({ one }) => ({
  category: one(categories, {
    fields: [notes.categoryId],
    references: [categories.id]
  }),
  user: one(users, {
    fields: [notes.userId],
    references: [users.id]
  })
}));
