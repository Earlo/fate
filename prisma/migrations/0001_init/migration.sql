CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  admin BOOLEAN NOT NULL DEFAULT false,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS character_sheets (
  id TEXT PRIMARY KEY,
  icon JSONB,
  color_palette JSONB,
  name JSONB NOT NULL,
  description JSONB,
  fate JSONB,
  aspects JSONB,
  skills JSONB,
  stunts JSONB,
  extras JSONB,
  stress JSONB,
  consequences JSONB,
  notes JSONB,
  public BOOLEAN NOT NULL DEFAULT false,
  visible_to TEXT[] NOT NULL DEFAULT '{}',
  owner TEXT REFERENCES users(id) ON DELETE CASCADE,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon JSONB,
  description TEXT,
  color_palette JSONB,
  aspects JSONB,
  skills JSONB,
  groups JSONB,
  public BOOLEAN NOT NULL DEFAULT false,
  notes JSONB,
  visible_to TEXT[] NOT NULL DEFAULT '{}',
  owner TEXT REFERENCES users(id) ON DELETE CASCADE,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
