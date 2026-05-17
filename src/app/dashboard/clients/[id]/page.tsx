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

export default function ClientDetailPage({ params }: Params) {
  const owner = getOwnerProfile();
  const client = getClient(params.id);
  if (!client || client.profile_id !== owner.id) notFound();

  const notes = listTherapistPrivateNotes(owner.id, client.id);
  const feedback = listClientFeedbackForProfile(owner.id, client.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Клиент: {client.name}
      </h1>
      <ClientDetail
        client={client}
        notes={notes}
        feedback={feedback}
        siteUrl={SITE_URL}
      />
    </div>
  );
}
