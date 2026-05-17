import type { Metadata } from "next";
import { MatchResultsView } from "@/components/MatchResultsView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Результаты подбора",
  path: "/match/results",
  noindex: true,
});

export default function MatchResultsPage() {
  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">
        Подходящие специалисты
      </h1>
      <p className="mt-1 text-slate-600">
        Топ-3 по вашим параметрам. Это не медицинская консультация.
      </p>
      <div className="mt-6">
        <MatchResultsView />
      </div>
    </div>
  );
}
