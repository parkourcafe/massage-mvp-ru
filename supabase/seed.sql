-- Demo seed for the Supabase backend (DB_BACKEND=supabase).
-- Mirrors the in-memory demo profile "Анна Ковалёва" so a fresh
-- Supabase project shows data without a manual signup.
--
-- Idempotent: fixed ids + ON CONFLICT DO NOTHING. Safe to re-run.
--
-- Notes discovered against the live schema:
--  * plans is FK-referenced by profiles.plan_id, so the three plan rows
--    are required reference data (must be inserted before any profile).
--  * service/media ids are real UUIDs (those columns are uuid); the
--    in-memory store uses short ids which Postgres would reject.
--  * profiles.user_id / favorites.user_id / support_requests.user_id are
--    uuid, but users.id is text — so the owner link is left NULL here.
--    Linking the demo profile to user-anna (and the whole auth/owner/
--    favorites/support path on Supabase) requires migrating those
--    user_id columns to text. After that migration, set
--    profiles.user_id = 'user-anna'.

begin;

insert into public.plans (id, title, price_rub, period_days, features, is_active) values
  ('free', 'Free', 0, 0,
   '{"canUseSeoIndexing":false,"canReceiveBookings":false,"canUseMediaFull":false,"canUseClientCRM":false,"canUseAnalytics":false,"canUseManagerSupport":false,"canUseAiImport":false,"canUseAiMatchVisibility":false,"canUseInternalMessaging":false,"canUsePrivateSessionNotes":false}'::jsonb,
   true),
  ('pro', 'Pro', 490, 30,
   '{"canUseSeoIndexing":true,"canReceiveBookings":true,"canUseMediaFull":true,"canUseClientCRM":true,"canUseAnalytics":true,"canUseManagerSupport":true,"canUseAiImport":true,"canUseAiMatchVisibility":true,"canUseInternalMessaging":true,"canUsePrivateSessionNotes":true}'::jsonb,
   true),
  ('expert', 'Expert', 980, 30,
   '{"canUseSeoIndexing":true,"canReceiveBookings":true,"canUseMediaFull":true,"canUseClientCRM":true,"canUseAnalytics":true,"canUseManagerSupport":true,"canUseAiImport":true,"canUseAiMatchVisibility":true,"canUseInternalMessaging":true,"canUsePrivateSessionNotes":true,"canUseFeaturedPlacement":true,"canUseExpandedAnalytics":true,"canUsePdfProfile":true,"canUsePrioritySupport":true}'::jsonb,
   true)
on conflict (id) do nothing;

insert into public.users (id, email, password_hash, role, created_at)
values ('user-anna', 'demo@massage.ru', 'plain$demo1234', 'therapist',
        '2026-01-01T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.profiles (
  id, user_id, slug, full_name, gender, show_gender, years_experience,
  headline, professional_description, safety_boundaries, faq, country,
  city, district, nearest_landmark, therapist_address_private,
  public_location_label, works_at_own_place, travels_to_client,
  works_in_hotels, works_in_villas, works_in_salon, travel_districts,
  minimum_booking_price, transport_fee, timezone, languages, price_from,
  session_durations, whatsapp, telegram_url, vk_url, instagram_url,
  website_url, plan_id, is_published, quality_score, moderation_status,
  created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111', null, 'anna-kovaleva',
  'Анна Ковалёва', 'female', true, 9,
  'Лечебно-оздоровительный и расслабляющий массаж',
  'Дипломированный массажист. Специализируюсь на работе со спиной, шейно-воротниковой зоной и восстановлении после нагрузок. Спокойная атмосфера, индивидуальный подход.',
  'Работаю строго в рамках профессионального оздоровительного массажа. Эротический и интимный контент недопустим. Соблюдаю гигиену и профессиональные границы.',
  '[{"q":"Что взять с собой?","a":"Ничего, всё необходимое предоставляю."},{"q":"Есть ли противопоказания?","a":"Да, обсуждаем до сеанса. Это не медицинская консультация."}]'::jsonb,
  'Россия', 'Москва', 'Хамовники', 'м. Парк культуры',
  'приватный адрес (не публикуется)',
  'Москва, центр (Хамовники), рядом с м. Парк культуры',
  true, true, true, false, false,
  array['Хамовники', 'Арбат', 'Якиманка'],
  3000, 500, 'Europe/Moscow', array['Русский', 'Английский'], 3000,
  array[60, 90, 120], '+79991234567',
  'https://t.me/anna_massage_demo', 'https://vk.com/anna_massage_demo',
  null, 'https://anna-massage.example', 'pro', true, 88, 'approved',
  '2026-01-10T10:00:00.000Z', '2026-04-01T10:00:00.000Z'
) on conflict (id) do nothing;

insert into public.services (
  id, profile_id, modality, title, description, duration, price,
  contraindication_note, is_published, sort_order
) values
  ('a1111111-1111-1111-1111-111111111101',
   '11111111-1111-1111-1111-111111111111', 'classic',
   'Классический массаж', 'Общий классический массаж тела.', 60, 3000,
   null, true, 0),
  ('a1111111-1111-1111-1111-111111111102',
   '11111111-1111-1111-1111-111111111111', 'back', 'Массаж спины',
   'Проработка спины и поясницы.', 45, 2500,
   'Не выполняется при острых болях — нужна консультация врача.',
   true, 1),
  ('a1111111-1111-1111-1111-111111111103',
   '11111111-1111-1111-1111-111111111111', 'lymphatic',
   'Лимфодренажный массаж', 'Мягкая лимфодренажная техника.', 90, 4500,
   null, true, 2)
on conflict (id) do nothing;

insert into public.profile_media (
  id, profile_id, type, url, title, alt_text, sort_order, is_published
) values
  ('b1111111-1111-1111-1111-111111111101',
   '11111111-1111-1111-1111-111111111111', 'profile_photo',
   'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
   null, 'Профессиональный массажист Анна', 0, true),
  ('b1111111-1111-1111-1111-111111111102',
   '11111111-1111-1111-1111-111111111111', 'workspace_photo',
   'https://images.unsplash.com/photo-1519823551278-64ac92734fb1',
   null, 'Кабинет для массажа', 1, true),
  ('b1111111-1111-1111-1111-111111111103',
   '11111111-1111-1111-1111-111111111111', 'certificate',
   'https://example.com/cert/anna.pdf', 'Диплом массажиста', null, 2,
   true),
  ('b1111111-1111-1111-1111-111111111104',
   '11111111-1111-1111-1111-111111111111', 'intro_video',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'О моей работе', null,
   3, true)
on conflict (id) do nothing;

commit;
