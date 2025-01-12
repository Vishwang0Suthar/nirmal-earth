import {integer, varchar, pgTable, serial, text, timestamp, json, boolean, jsonb} from 'drizzle-orm/pg-core'

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name',{length:255}).notNull(),
    email: varchar('email',{length:255}).notNull().unique(),
    password: varchar(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    // updated_at: timestamp()
})

export const Reports = pgTable('reports', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(()=> Users.id),
    location: text('location').notNull(),
    wasteType: varchar('wasteType',{length:255}).notNull(),
    amount: integer('amount').notNull(),
    imageUrl:text('imageUrl'),
    verificationResult: jsonb('verificationResult'),
    status: varchar('status',{length:255}).notNull().default('pending'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    collectorId: integer('collectorId').references(()=> Users.id),
})