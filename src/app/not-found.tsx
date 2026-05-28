import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="container-px py-24 text-center">
      <h1 className="text-4xl text-heading">
        {locale === "ru" ? "Страница не найдена" : "Page not found"}
      </h1>
      <p className="mt-3 text-body">
        {locale === "ru"
          ? "Страница могла быть перемещена, профиль больше недоступен, либо URL неполный."
          : "The page may have moved, the profile may no longer be available, or the URL may be incomplete."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-secondary">
          {locale === "ru" ? "Главная" : "Home"}
        </Link>
        <Link href="/directory" className="btn-primary">
          {locale === "ru" ? "Открыть каталог" : "Browse directory"}
        </Link>
      </div>
    </div>
  );
}
