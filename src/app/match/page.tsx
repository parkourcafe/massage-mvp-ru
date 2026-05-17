import type { Metadata } from "next";
import { MatchWizard } from "@/components/MatchWizard";
import { pageMetadata, PLATFORM_NOTICE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI-подбор массажиста",
  description:
    "Ответьте на вопросы — AI подберёт профессионального массажиста под вашу цель, бюджет и формат.",
  path: "/match",
});

export default function MatchPage() {
  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">AI-подбор специалиста</h1>
      <p className="mt-1 text-slate-600">
        Заполните короткую анкету — мы предложим до 3 подходящих специалистов.
      </p>
      <p className="mt-2 text-sm text-brand-700">{PLATFORM_NOTICE}</p>
      <div className="mt-6 card">
        <MatchWizard />
      </div>
    </div>
  );
}
