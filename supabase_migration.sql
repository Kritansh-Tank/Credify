-- =============================================
-- Store Rating Platform — Supabase SQL Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. STORES TABLE (created first, users references it)
CREATE TABLE IF NOT EXISTS stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL DEFAULT '',
  password   VARCHAR      NOT NULL,
  role       TEXT         NOT NULL CHECK (role IN ('admin', 'user', 'owner')) DEFAULT 'user',
  store_id   UUID         REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3. RATINGS TABLE
CREATE TABLE IF NOT EXISTS ratings (
  id         UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID       NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   UUID       NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  value      SMALLINT   NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);

-- 4. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);
CREATE INDEX IF NOT EXISTS idx_ratings_store  ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user   ON ratings(user_id);

-- 6. SEED DEFAULT ADMIN
-- Password: Admin@1234 (bcrypt hash, 12 rounds)
INSERT INTO users (name, email, address, password, role)
VALUES (
  'System Administrator',
  'admin@platform.com',
  'Platform HQ, Admin Address',
  '$2a$12$K.FjEyv5X8Q1Uh2V9y3L.eO5t7c2r1mL8vBJv0vD0bZ0bvpYhEL2S',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Done! Tables: users, stores, ratings
-- Admin login: admin@platform.com / Admin@1234
-- =============================================
