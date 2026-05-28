# Передача проекта разработчику

Чек-лист, что нужно выдать новому разработчику для работы над платформой
MassageMatch (репозиторий `parkourcafe/massage-mvp-ru`). Документ
рассчитан на одну страницу — детали по конкретным сервисам и
переменным смотри по ссылкам в репозитории.

## 1. Доступы — пригласить через UI сервисов

| Сервис | Что | Где добавить |
| --- | --- | --- |
| GitHub | репозиторий `parkourcafe/massage-mvp-ru` | Settings → Collaborators → Invite. Роль Write или Admin. |
| Netlify | сайт `massage-mvp-ru` (прод-URL `https://massage-mvp-ru.netlify.app`) | Team settings → Members → Invite. Минимум — Developer (нужен доступ к Site configuration, Deploys, Environment variables). |
| Supabase | организация **kora bali** → проект `massage-mvp-ru` (ref `xhfadyrbohcdgssznzji`) | Organization → Team / Members → Invite. Роль Developer или Owner. |

Пароли личных аккаунтов не передавать — приглашать как члена команды.

## 2. Стек и среды

- Next.js 14 (App Router), TypeScript, Tailwind.
- Хостинг: Netlify (`@netlify/plugin-nextjs`). Боевая ветка — `main`,
  branch-deploys включены для всех веток.
- БД: Supabase Postgres, проект `xhfadyrbohcdgssznzji` (регион EU
  Central, план free).
- Авторизация — собственная (HMAC-куки + scrypt-пароли,
  см. `src/lib/auth/`). Supabase Auth не используется.

## 3. Текущая feature-ветка

`claude/check-netlify-build-xFu56` — добавляет PWA-функциональность
для `/app` (service worker, manifest с PNG-иконками 192/512 + maskable,
кнопка «Установить») и правит захардкоженный лейбл
«Санкт-Петербург» → «Москва · Санкт-Петербург».

**В `main` ещё не влита** — для выкатки на прод нужен мерж.

## 4. Правило деплоя

Боевой деплой делается **не чаще одного раза в день** (записано в
`CLAUDE.md`). Прод собирается автоматически при пуше в `main`.
Превью — branch-deploys по любой ветке.

## 5. Environment variables

Полный шаблон — `.env.example`. На момент передачи в Netlify
настроено:

| Ключ | Назначение | Статус |
| --- | --- | --- |
| `DB_BACKEND=supabase` | переключатель данных | задано |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase API | задано (`https://xhfadyrbohcdgssznzji.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side ключ Supabase | задано (рекомендуется ротировать — см. п. 8) |
| `AUTH_SECRET` | подпись session-кук | задано (рекомендуется ротировать — см. п. 8) |
| `NEXT_PUBLIC_SITE_URL` | канонический URL для SEO | задано |
| `PRO_PLAN_PRICE_RUB=490` | цена Pro (Expert = ×2) | задано |
| `OPENAI_MODEL=gpt-4o-mini` | модель по умолчанию | задано |
| `OPENAI_API_KEY` | для AI-подбора и AI-импорта | задать перед включением AI |
| `YOOKASSA_SHOP_ID` / `_SECRET_KEY` / `_WEBHOOK_SECRET` | оплата | задать перед включением биллинга |
| `YANDEX_VERIFICATION` | подтверждение в Я.Вебмастере | задать при подключении |
| `NEXT_PUBLIC_YM_ID` / `NEXT_PUBLIC_GA_ID` | аналитика | опционально |

`NEXT_PUBLIC_SUPABASE_ANON_KEY` нигде в коде не используется
(`src/lib/supabase.ts:getAnonClient` не вызывается) — можно не задавать.

## 6. Учётные записи в приложении

- **Админ:** в боевой базе создана учётка `victorialarust@gmail.com`
  с ролью `admin` в таблице `users`. Пароль передаётся отдельно через
  менеджер паролей (в репозиторий не класть). Доступ модератора
  определяется полем `users.role='admin'`. Переменная `ADMIN_EMAILS` в
  коде **не читается** — это устаревший комментарий, можно не
  выставлять.
- **Демо-мастер:** в продакшн-базе засеяна Анна Ковалёва (email
  `demo@massage.ru`, пароль `demo1234`, схема `plain$`). Перед
  публичным запуском можно удалить или оставить для пресейлов.

## 7. PWA / `/app`

`/app` — это не отдельное нативное приложение, а страница в Next.js
(`src/app/app/page.tsx`), оформленная как мобильный экран. На
feature-ветке она сделана устанавливаемой как PWA:

- `public/sw.js` — service worker (network-first для навигаций,
  stale-while-revalidate для статики, white-list безопасных публичных
  путей).
- `src/app/manifest.ts` — манифест: `start_url=/app`, scope, иконки
  192/512 и maskable.
- `src/app/icon-192/route.tsx`, `src/app/icon-512/route.tsx` —
  генерация PNG-иконок через `next/og`.
- `src/components/InstallPWA.tsx` — кнопка «Установить» (Chromium) и
  инструкция для iOS.
- `src/components/ServiceWorkerRegister.tsx` — регистрация SW (только
  в production).

На iOS установка делается через «Поделиться → На экран „Домой“» —
`beforeinstallprompt` Apple не поддерживает.

## 8. Безопасность — после хэндовера

- **Ротировать `SUPABASE_SERVICE_ROLE_KEY`:** Supabase → Project
  Settings → API → Roll service_role. После — обновить значение в
  Netlify env (для всех контекстов).
- **Ротировать `AUTH_SECRET`** в Netlify (любая случайная строка
  64 символа, например `openssl rand -hex 32`). Это инвалидирует все
  текущие сессии — нормально.
- **Сменить пароль админа** в БД: сгенерировать хеш функцией
  `hashPassword(password)` из `src/lib/auth/password.ts` и выполнить
  `update users set password_hash = '...' where email = 'victorialarust@gmail.com';`.
- Передавать секреты только через менеджер паролей (1Password,
  Bitwarden) или одноразовый зашифрованный канал. Не через мессенджеры
  и почту.

## 9. Полезные точки входа в коде

- `CLAUDE.md` — заметки для AI-агентов и правило деплоя.
- `.env.example` — шаблон env-переменных.
- `supabase/migrations/` — миграции схемы (применены все, последняя
  `0009_therapist_availability`).
- `supabase/seed.sql` — демо-данные, идемпотентный сид.
- `src/lib/db/factory.ts`, `src/lib/db/index.ts` — выбор между
  Supabase- и memory-репозиториями по `DB_BACKEND`.
- `src/lib/auth/` — авторизация и хеширование паролей.
- `src/app/api/` — REST-эндпоинты.
- `src/app/admin/` — модераторская часть.

## 10. Команды

```bash
npm install        # установить зависимости
npm run dev        # локальный dev (по умолчанию memory-режим)
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run build      # боевая сборка
npm run test       # vitest
```
