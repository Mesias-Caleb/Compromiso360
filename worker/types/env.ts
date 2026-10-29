export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_PASSWORD_SALT?: string;
  SESSION_SECRET?: string;
  COMMITMENT_URL?: string;
}
