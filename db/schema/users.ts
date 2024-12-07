import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { uuidv7 } from 'uuidv7'

export const users = sqliteTable('users', {
	id: text('id').primaryKey().$default(uuidv7).notNull(),
	name: text('name').notNull(),
	email: text('email').unique().notNull(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date())
		.notNull()
})
