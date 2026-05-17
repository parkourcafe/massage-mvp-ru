import { NextResponse } from "next/server";
import { z } from "zod";
import { listAllProfiles, saveMatch } from "@/lib/db";
import { runMatch, type MatchQuestionnaire } from "@/lib/matching";
import { explainMatch } from "@/lib/ai";
import { can } from "@/lib/plans";
import { moderateText } from "@/lib/moderation";

export const dynamic = "force-dynamic";

const schema = z.object({
  massage_goal: z.string().max(500).optional(),
  pain_or_focus_area: z.string().max(300).optional(),
  preferred_service_type: z.string().optional(),
  pressure_preference: z.enum(["soft", "medium", "strong", "not_sure"]).optional(),
  duration_preference: z.coerce.number().int().positive().max(360).optional(),
  therapist_gender_preference: z
    .enum(["no_preference", "female", "male"])
    .optional(),
  city: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  location_type: z.string().optional(),
  needs_travel_to_client: z.coerce.boolean().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  budget: z.coerce.number().int().positive().max(1_000_000).optional(),
  language_preference: z.string().optional(),
  important_notes: z.string().max(800).optional(),
  contraindications_or_health_notes: z.string().max(800).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте анкету" }, { status: 400 });
  }
  const q = parsed.data as MatchQuestionnaire;

  const mod = moderateText(
    [q.massage_goal, q.important_notes, q.pain_or_focus_area]
      .filter(Boolean)
      .join(" ")
  );
  if (!mod.ok) {
    return NextResponse.json(
      {
        error:
          "Запрос содержит недопустимый контент. Платформа — только профессиональный оздоровительный массаж.",
      },
      { status: 422 }
    );
  }

  // Only Pro/Expert profiles are visible in AI match results.
  const profiles = listAllProfiles().filter((p) =>
    can(p.plan_id, "canUseAiMatchVisibility")
  );

  const results = runMatch(profiles, q, 3);

  // Persist the request + results so therapists see incoming matches.
  if (results.length > 0) {
    saveMatch(
      {
        massage_goal: q.massage_goal ?? null,
        pain_or_focus_area: q.pain_or_focus_area ?? null,
        preferred_service_type: q.preferred_service_type ?? null,
        city: q.city ?? null,
        district: q.district ?? null,
        budget: q.budget ?? null,
      },
      results.map((r) => ({
        profile_id: r.profile.id,
        score: r.score,
        service_recommendation: r.serviceRecommendation,
        reasons: r.reasons,
        risks: r.risks,
      }))
    );
  }

  const enriched = await Promise.all(
    results.map(async (r) => ({
      profileId: r.profile.id,
      slug: r.profile.slug,
      name: r.profile.full_name,
      city: r.profile.city,
      district: r.district,
      price: r.price,
      score: r.score,
      reasons: r.reasons,
      risks: r.risks,
      serviceRecommendation: r.serviceRecommendation,
      why: await explainMatch(q, r),
    }))
  );

  return NextResponse.json({
    ok: true,
    results: enriched,
    disclaimer:
      "Это не медицинская консультация. При наличии заболеваний и противопоказаний проконсультируйтесь с врачом.",
  });
}
