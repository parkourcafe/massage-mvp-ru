import { AppShell } from "@/components/AppShell";
import { AuthRuntimeForm } from "@/components/AuthRuntimeForm";
import { PreviewAuthPanel } from "@/components/PreviewAuthPanel";
import { getRoleLabel } from "@/lib/i18n/labels";
import { getI18n } from "@/lib/i18n/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase";
import { getAppUserContext } from "@/lib/strand/authz";

export default async function AuthPage() {
  const { locale } = await getI18n();
  const context = await getAppUserContext();
  const copy =
    locale === "ru"
      ? {
          eyebrow: "Auth",
          title: "Войти или создать аккаунт",
          intro:
            "MVP foundation поддерживает клиентский и модельный account paths, восстановление пароля и напоминание 18+. Авторизация должна опираться на DB-backed roles, а не на auth metadata.",
          previewTitle: "Preview-доступ по ролям",
          authRuntime: "Текущий auth runtime",
          authRuntimeValue: isSupabaseAuthConfigured
            ? "Supabase-backed auth"
            : "Preview fallback",
          currentRole: "Текущая роль",
          previewBody:
            isSupabaseAuthConfigured
              ? "Этот auth surface уже использует Supabase-backed path, если окружение настроено, и сохраняет preview fallback только как резерв для локальной демонстрации."
              : "Этот auth surface сейчас работает через preview fallback для STRAND route guards. При наличии настроенного окружения он переключается на реальную Supabase auth и DB-backed role assignment.",
          login: "Вход",
          signup: "Регистрация",
          forgotPassword: "Забыли пароль",
          email: "Email",
          emailHint:
            "Placeholder-форма сохранена для будущей реализации Supabase auth.",
          password: "Пароль",
          passwordPlaceholder: "Введите пароль",
          continue: "Продолжить",
          reset: "Отправить ссылку для сброса",
          note:
            "Пользователи должны быть 18+, чтобы создавать и использовать аккаунты на платформе. Переключение preview-role существует только для тестирования MVP foundation во время разработки.",
        }
      : {
          eyebrow: "Auth",
          title: "Sign in or create an account",
          intro:
            "The MVP foundation supports client and model account paths, password recovery, and an 18+ reminder. Authorization should be enforced by DB-backed roles, not auth metadata.",
          previewTitle: "Preview role access",
          authRuntime: "Current auth runtime",
          authRuntimeValue: isSupabaseAuthConfigured
            ? "Supabase-backed auth"
            : "Preview fallback",
          currentRole: "Current role",
          previewBody:
            isSupabaseAuthConfigured
              ? "This auth surface already uses a Supabase-backed path when the environment is configured and keeps preview fallback only as a local demo reserve."
              : "This auth surface currently uses preview fallback for STRAND route guards. When the environment is configured it switches to real Supabase auth and DB-backed role assignment.",
          login: "Log in",
          signup: "Sign up",
          forgotPassword: "Forgot password",
          email: "Email address",
          emailHint:
            "Placeholder form retained for the future Supabase auth implementation.",
          password: "Password",
          passwordPlaceholder: "Enter your password",
          continue: "Continue",
          reset: "Send reset link",
          note:
            "Visitors must be 18+ to create or use accounts on the platform. Preview role switching exists only to exercise the MVP foundation during development.",
        };

  return (
    <AppShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6">
          <p className="eyebrow">{copy.previewTitle}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-secondary">
            {copy.authRuntime}: {copy.authRuntimeValue}
          </p>
          <h2 className="mt-3 text-3xl text-heading">
            {copy.currentRole}: {getRoleLabel(locale, context.role)}
          </h2>
          <p className="mt-3 text-sm leading-7 text-body">
            {copy.previewBody}
          </p>
          <div className="mt-5">
            <PreviewAuthPanel
              currentRole={getRoleLabel(locale, context.role)}
              currentSource={context.source}
            />
          </div>
        </div>
        <div className="panel grid gap-5 p-6">
          <AuthRuntimeForm />
        </div>
      </div>
    </AppShell>
  );
}
