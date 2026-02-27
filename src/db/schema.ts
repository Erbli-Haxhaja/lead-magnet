import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// ─── Admins ──────────────────────────────────────────────────
export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Senders ─────────────────────────────────────────────────
export const senders = pgTable("senders", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Email Templates ─────────────────────────────────────────
export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyFormat: varchar("body_format", { length: 10 }).default("html").notNull(), // 'html' | 'text'
  htmlBody: text("html_body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Documents ───────────────────────────────────────────────
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    fileKey: text("file_key").notNull(), // R2 object key
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(), // bytes
    isActive: boolean("is_active").default(true).notNull(),
    senderId: uuid("sender_id").references(() => senders.id, {
      onDelete: "set null",
    }),
    emailTemplateId: uuid("email_template_id").references(
      () => emailTemplates.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("documents_slug_idx").on(table.slug)]
);

// ─── Leads ───────────────────────────────────────────────────
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    source: varchar("source", { length: 255 }), // slug of the document
    capturedAt: timestamp("captured_at").defaultNow().notNull(),
  },
  (table) => [index("leads_email_idx").on(table.email)]
);

// ─── Email Sends ─────────────────────────────────────────────
export const emailSends = pgTable(
  "email_sends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    resendEmailId: varchar("resend_email_id", { length: 255 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    deliveredAt: timestamp("delivered_at"),
  },
  (table) => [
    index("email_sends_document_idx").on(table.documentId),
    index("email_sends_resend_id_idx").on(table.resendEmailId),
  ]
);

// ─── Document Views (landing page opens) ─────────────────────
export const documentViews = pgTable(
  "document_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => [index("document_views_document_idx").on(table.documentId)]
);

// ─── Types ───────────────────────────────────────────────────
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Sender = typeof senders.$inferSelect;
export type NewSender = typeof senders.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type EmailSend = typeof emailSends.$inferSelect;
export type NewEmailSend = typeof emailSends.$inferInsert;
export type DocumentView = typeof documentViews.$inferSelect;
