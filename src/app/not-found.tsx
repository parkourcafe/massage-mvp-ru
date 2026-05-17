import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Страница не найдена</h1>
      <p className="mt-2 text-slate-600">
        Возможно, специалист снят с публикации или ссылка устарела.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-secondary">
          На главную
        </Link>
        <Link href="/therapists" className="btn-primary">
          Каталог специалистов
        </Link>
      </div>
    </div>
  );
}
