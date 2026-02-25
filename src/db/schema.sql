-- ============================================================
-- HTD Solutions Lead Magnet System — Database Schema
-- PostgreSQL (Neon)
-- ============================================================
-- Run this against your Neon database to create all tables,
-- or use `npm run db:push` to let Drizzle handle it for you.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Admins ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Documents ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  slug        VARCHAR(255)  NOT NULL UNIQUE,
  file_key    TEXT          NOT NULL,     -- Cloudflare R2 object key
  file_name   VARCHAR(255)  NOT NULL,
  file_type   VARCHAR(100)  NOT NULL,
  file_size   INTEGER       NOT NULL,     -- size in bytes
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_slug_idx ON documents (slug);

-- ─── Leads ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255)  NOT NULL,
  source      VARCHAR(255),               -- slug of the originating document
  captured_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

-- ─── Email Sends ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_sends (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID          NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  lead_id         UUID          NOT NULL REFERENCES leads(id)     ON DELETE CASCADE,
  resend_email_id VARCHAR(255),            -- ID returned by the Resend API
  status          VARCHAR(50)   NOT NULL DEFAULT 'pending',
  sent_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS email_sends_document_idx   ON email_sends (document_id);
CREATE INDEX IF NOT EXISTS email_sends_resend_id_idx  ON email_sends (resend_email_id);

-- ─── Document Views (landing page opens) ─────────────────────
CREATE TABLE IF NOT EXISTS document_views (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID          NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
  ip_address  VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS document_views_document_idx ON document_views (document_id);
