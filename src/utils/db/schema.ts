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
    amount: text('amount').notNull(),
    imageUrl:text('imageUrl'),
    verificationResult: jsonb('verificationResult'),
    status: varchar('status',{length:255}).notNull().default('pending'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    collectorId: integer('collectorId').references(()=> Users.id),
})

export const Rewards = pgTable('rewards', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(()=> Users.id),
    points: integer('points').notNull().default(0),
    level: integer("level").notNull().default(1),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    isAvailable: boolean('isAvailable').notNull().default(true),
    description: text('description'),
    name: varchar('name',{length:255}).notNull(),
    collectionInfo:text('collectionInfo').notNull(),
})

export const CollectedWastes = pgTable('collected-waste',{
    id: serial('id').primaryKey(),
    reportId: integer('reportId').notNull().references(()=> Reports.id),
    collectorId: integer('collectorId').notNull().references(()=> Users.id),
    status: varchar('status',{length:255}).notNull().default('pending'),
})

export const Notifications = pgTable('notifications',{
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(()=> Users.id),
    message: text('message').notNull(),
    type: varchar('type',{length:255}).notNull(),
    isRead: boolean('isRead').notNull().default(false),
    created_at: timestamp('created_at').notNull().defaultNow(),
})

export const Transactions = pgTable('transactions',{
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(()=> Users.id),
    type: varchar('type',{length:20}).notNull(),
    amount: integer('amount').notNull(),
    description: text('description').notNull(),
    date: timestamp('date').notNull().defaultNow(),
})