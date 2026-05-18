import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientByToken, getRawProfileById } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { ClientFeedbackForm } from "@/components/ClientFeedbackForm";

type Params = { params: { token: string } };

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Обратная связь", noindex: true });
}

export default async function ClientFeedbackPage({ params }: Params) {
  const client = await getClientByToken(params.token);
  if (!client) notFound();
  const therapist = await getRawProfileById(client.profile_id);

  return (
    <div className="bg-page">
      <div className="container-px py-12 sm:py-16 max-w-2xl">
        <span className="eyebrow">Обратная связь</span>
        <h1 className="h1 mt-5">
          Как прошёл сеанс{therapist ? ` у ${therapist.full_name}` : ""}?
        </h1>
        <p className="small mt-4">
          Это ваша личная защищённая страница. Не передавайте ссылку третьим
          лицам. Страница не индексируется. Ваш отзыв виден только специалисту
          и <strong className="text-body">никогда не публикуется</strong> на
          сайте.
        </p>

        <div className="mt-8">
          <ClientFeedbackForm token={params.token} />
        </div>
      </div>
    </div>
  );
}
