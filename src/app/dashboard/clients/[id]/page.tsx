import { notFound } from "next/navigation";
import { getClient, getOwnerProfile } from "@/lib/db";
import { ClientDetail } from "@/components/ClientDetail";

type Params = { params: { id: string } };

export default function ClientDetailPage({ params }: Params) {
  const owner = getOwnerProfile();
  const client = getClient(params.id);
  if (!client || client.profile_id !== owner.id) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Клиент: {client.name}
      </h1>
      <ClientDetail client={client} />
    </div>
  );
}
