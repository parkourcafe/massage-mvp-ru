import { redirect } from "next/navigation";

export default function TherapistRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/models/${params.slug}`);
}

