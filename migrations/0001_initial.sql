-- Migración inicial: tabla de compromisos y sesiones de administrador
-- PEI Compromiso 360° — Base de datos D1

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  campus TEXT NOT NULL CHECK (campus IN ('LIM', 'JUL', 'TPP')),
  area TEXT NOT NULL,
  area_name TEXT NOT NULL,
  texto_version TEXT NOT NULL,
  accepted INTEGER NOT NULL DEFAULT 0,
  publish_permission INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commitments_campus ON commitments(campus);
CREATE INDEX IF NOT EXISTS idx_commitments_area ON commitments(area);
CREATE INDEX IF NOT EXISTS idx_commitments_created_at ON commitments(created_at);

-- Tabla de sesiones de administrador (solo para autenticación del panel)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
