export default function Loading() {
  return (
    <div className="container-px py-16" aria-busy="true">
      <span className="sr-only">Загрузка профиля…</span>
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 animate-pulse rounded-full bg-line" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-1/2 max-w-sm animate-pulse rounded bg-line" />
          <div className="h-4 w-2/3 max-w-md animate-pulse rounded bg-line" />
        </div>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3" aria-hidden>
          <div className="h-4 w-full animate-pulse rounded bg-line" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-line" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-line" />
          <div className="mt-8 h-40 w-full animate-pulse rounded-xl2 bg-line" />
        </div>
        <div
          className="h-64 w-full animate-pulse rounded-xl2 border border-line bg-card"
          aria-hidden
        />
      </div>
    </div>
  );
}
