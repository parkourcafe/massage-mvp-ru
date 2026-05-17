-- ============================================================
-- Auth users. Therapist owns a profile via profiles.user_id =
-- users.id. Passwords are scrypt-hashed (src/lib/auth/password.ts);
-- seed/demo accounts use the readable `plain$` marker.
-- Service-role only (RLS denies by default — no anon policy).
-- ============================================================

create table if not exists users (
  id            text primary key,
  email         text unique not null,
  password_hash text not null,
  role          text not null default 'therapist',  -- therapist|admin
  created_at    timestamptz not null default now()
);

alter table users enable row level security;
