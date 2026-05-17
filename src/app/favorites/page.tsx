import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Избранное",
  path: "/favorites",
  noindex: true,
});

export default function FavoritesPage() {
  return (
    <div className="container-px py-10">
      <h1 className="text-2xl font-bold text-slate-900">Избранные специалисты</h1>
      <p className="mt-1 text-slate-600">
        Сохранённые специалисты. Для гостей список хранится в браузере.
      </p>
      <div className="mt-6">
        <FavoritesView />
      </div>
    </div>
  );
}
