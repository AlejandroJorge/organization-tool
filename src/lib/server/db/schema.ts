import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique()
})

export const tasks = sqliteTable('task', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  status: integer('status', { mode: "boolean" }).notNull().default(false),
  due: integer('due', { mode: "timestamp" }),
  content: text('content'),
  categoryId: text('category_id').notNull()
})

export const notes = sqliteTable('note',{
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  content: text('content'),
  categoryId: text('category_id').notNull()
})

export const categoryRelations = relations(categories,({many})=>({
  tasks: many(tasks),
  notes: many(notes)
}))

export const taskRelations = relations(tasks,({one})=>({
  category: one(categories,{
    fields: [tasks.categoryId],
    references: [categories.id]
  })
}))

export const notesRelations = relations(notes,({one})=>({
  category: one(categories,{
    fields: [notes.categoryId],
    references: [categories.id]
  })
}))
