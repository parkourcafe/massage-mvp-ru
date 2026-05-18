import { notFound } from "next/navigation";
import {
  getClient,
  getOwnerProfile,
  listClientFeedbackForProfile,
  listTherapistPrivateNotes,
} from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { ClientDetail } from "@/components/ClientDetail";

type Params = { params: { id: string } };

export default async function ClientDetailPage({ params }: Params) {
  const owner = await getOwnerProfile();
  const client = await getClient(params.id);
  if (!client || client.profile_id !== owner.id) notFound();

  const notes = await listTherapistPrivateNotes(owner.id, client.id);
  const feedback = await listClientFeedbackForProfile(owner.id, client.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Карточка клиента</p>
        <h1 className="h1 mt-3">{client.name}</h1>
      </div>
      <ClientDetail
        client={client}
        notes={notes}
        feedback={feedback}
        siteUrl={SITE_URL}
      />
    </div>
  );
}
