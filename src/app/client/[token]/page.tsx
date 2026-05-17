import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientByToken, getRawProfileById } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { ClientFeedbackForm } from "@/components/ClientFeedbackForm";

type Params = { params: { token: string } };

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Обратная связь", noindex: true });
}

export default function ClientFeedbackPage({ params }: Params) {
  const client = getClientByToken(params.token);
  if (!client) notFound();
  const therapist = getRawProfileById(client.profile_id);

  return (
    <div className="container-px py-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">
        Обратная связь специалисту{therapist ? `: ${therapist.full_name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Это ваша личная защищённая страница. Не передавайте ссылку третьим
        лицам. Страница не индексируется. Ваш отзыв виден только специалисту
        и <strong>никогда не публикуется</strong> на сайте.
      </p>

      <div className="mt-6">
        <ClientFeedbackForm token={params.token} />
      </div>
    </div>
  );
}
