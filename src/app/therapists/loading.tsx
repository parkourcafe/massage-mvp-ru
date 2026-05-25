export default function Loading() {
  return (
    <div className="container-px py-16" aria-busy="true">
      <span className="sr-only">Загрузка каталога…</span>
      <div className="h-4 w-40 animate-pulse rounded bg-line" />
      <div className="mt-6 h-10 w-2/3 max-w-xl animate-pulse rounded bg-line" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl2 border border-line bg-card p-6"
            aria-hidden
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-line" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-line" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-line" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-line" />
            </div>
            <div className="mt-6 h-9 w-32 animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
