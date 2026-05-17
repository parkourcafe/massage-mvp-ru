-- ============================================================
-- Public contact channels on therapist profiles. Unlike the tutor
-- reference (contact only via inquiry), a massage therapist needs
-- public reach-out channels. These columns ARE public (shown on the
-- profile); the private phone/address stay in their existing fields.
-- ============================================================

alter table profiles
  add column if not exists whatsapp       text,
  add column if not exists telegram_url   text,
  add column if not exists vk_url         text,
  add column if not exists instagram_url  text,
  add column if not exists website_url    text;
