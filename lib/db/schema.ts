import { pgTable, text, serial, timestamp, integer, boolean, uniqueIndex, index, varchar, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "sold_out",
  "upcoming",
  "archived",
]);

export const builderTierEnum = pgEnum("builder_tier", [
  "tier1",
  "tier2",
  "tier3",
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "view",
  "inquiry",
  "call",
  "email",
  "site_visit",
  "offer",
]);

// Better Auth Tables
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('user'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('user_email_idx').on(table.email),
    roleIdx: index('user_role_idx').on(table.role),
  })
)

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIdx: index('session_userId_idx').on(table.userId),
    tokenIdx: index('session_token_idx').on(table.token),
  })
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('account_userId_idx').on(table.userId),
    providerIdx: index('account_providerId_accountId_idx').on(table.providerId, table.accountId),
  })
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt'),
  }
)

// Real Estate App Tables

// Lead/Inquiry Table
export const lead = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    fullName: varchar('fullName', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
    locality: varchar('locality', { length: 255 }),
    budgetRange: varchar('budgetRange', { length: 50 }),
    bhkRequirement: varchar('bhkRequirement', { length: 10 }),
    source: varchar('source', { length: 50 }).default('web').notNull(),
    status: leadStatusEnum()
      .default("new")
      .notNull(),
    referenceId: varchar('referenceId', { length: 50 }).notNull().unique(),
    notes: text('notes'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('lead_userId_idx').on(table.userId),
    emailIdx: index('lead_email_idx').on(table.email),
    statusIdx: index('lead_status_idx').on(table.status),
    createdAtIdx: index('lead_createdAt_idx').on(table.createdAt),
    referenceIdIdx: uniqueIndex('lead_referenceId_idx').on(table.referenceId),
  })
)

// Property Table
export const property = pgTable(
  'properties',
  {
    id: serial('id').primaryKey(),
    builderId: integer('builderId').notNull().references(() => builder.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    locality: varchar('locality', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).default('Bangalore').notNull(),
    address: varchar('address', { length: 500 }),
    minPrice: integer('minPrice'),
    maxPrice: integer('maxPrice'),
    bhkOptions: varchar('bhkOptions', { length: 100 }),
    amenities: text('amenities'),
    totalUnits: integer('totalUnits'),
    soldUnits: integer('soldUnits').default(0),
    reraNumber: varchar('reraNumber', { length: 100 }).unique(),
    imageUrl: text('imageUrl'),
    status: propertyStatusEnum()
      .default("available")
      .notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    builderIdIdx: index('property_builderId_idx').on(table.builderId),
    localityIdx: index('property_locality_idx').on(table.locality),
    cityIdx: index('property_city_idx').on(table.city),
    statusIdx: index('property_status_idx').on(table.status),
    reraIdx: uniqueIndex('property_reraNumber_idx').on(table.reraNumber),
  })
)

// Builder Table
export const builder = pgTable(
  'builders',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }),
    phoneNumber: varchar('phoneNumber', { length: 20 }),
    website: varchar('website', { length: 255 }),
    description: text('description'),
    tier: builderTierEnum()
      .default("tier2")
      .notNull(),
    isVerified: boolean('isVerified').default(true).notNull(),
    totalProjects: integer('totalProjects').default(0),
    established: integer('established'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex('builder_name_idx').on(table.name),
    tierIdx: index('builder_tier_idx').on(table.tier),
    verifiedIdx: index('builder_isVerified_idx').on(table.isVerified),
  })
)

// Inquiry/Interaction Table
export const inquiry = pgTable(
  'inquiries',
  {
    id: serial('id').primaryKey(),
    leadId: integer('leadId').notNull().references(() => lead.id, { onDelete: 'cascade' }),
    propertyId: integer('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
    interactionType: interactionTypeEnum()
      .default("inquiry")
      .notNull(),
    notes: text('notes'),
    followUpDate: timestamp('followUpDate'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    leadIdIdx: index('inquiry_leadId_idx').on(table.leadId),
    propertyIdIdx: index('inquiry_propertyId_idx').on(table.propertyId),
    interactionTypeIdx: index('inquiry_interactionType_idx').on(table.interactionType),
    createdAtIdx: index('inquiry_createdAt_idx').on(table.createdAt),
  })
)

// Audit Log Table for compliance
export const auditLog = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: text('userId'),
    action: varchar('action', { length: 100 }).notNull(),
    entity: varchar('entity', { length: 50 }).notNull(),
    entityId: integer('entityId'),
    changes: text('changes'),
    ipAddress: varchar('ipAddress', { length: 45 }),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('auditLog_userId_idx').on(table.userId),
    entityIdx: index('auditLog_entity_entityId_idx').on(table.entity, table.entityId),
    createdAtIdx: index('auditLog_createdAt_idx').on(table.createdAt),
  })
)

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  leads: many(lead),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const leadRelations = relations(lead, ({ many }) => ({
  inquiries: many(inquiry),
}))

export const propertyRelations = relations(property, ({ one, many }) => ({
  builder: one(builder, { fields: [property.builderId], references: [builder.id] }),
  inquiries: many(inquiry),
}))

export const inquiryRelations = relations(inquiry, ({ one }) => ({
  lead: one(lead, { fields: [inquiry.leadId], references: [lead.id] }),
  property: one(property, { fields: [inquiry.propertyId], references: [property.id] }),
}))
