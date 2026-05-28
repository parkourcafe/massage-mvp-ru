import { redirect } from "next/navigation";

export default function TherapistBookingRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/models/${params.slug}`);
}

