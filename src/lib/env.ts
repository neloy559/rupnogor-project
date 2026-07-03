/**
 * Server-side environment variable validation.
 * This module MUST only be imported from server-side code
 * (API routes, Server Components, db.ts, server.ts).
 *
 * Validates that all required env vars are present at first import.
 * Provides type-safe access via the env() helper.
 */

const required = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

type EnvKey = (typeof required)[number];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `\n❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join('\n')}\n\n` +
    `Copy .env.example to .env.local and fill in all values.\n`
  );
}

/**
 * Type-safe access to validated env vars.
 */
export function env(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}