import type { MatchQuestionnaire, MatchResult } from "./matching";
import { modalityLabel } from "./catalog";
import { logAiGeneration } from "./db";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const isAiConfigured = Boolean(apiKey);

// Optional natural-language explanation layer on top of the deterministic
// matcher. When OpenAI is not configured we return a clear, rule-based
// explanation so the feature works offline / in CI.
export async function explainMatch(
  q: MatchQuestionnaire,
  r: MatchResult
): Promise<string> {
  const fallback = () => {
    const goal = q.massage_goal ? `Цель: ${q.massage_goal}. ` : "";
    return `${goal}Рекомендуем «${r.serviceRecommendation}». ${r.reasons.join(
      "; "
    )}.${r.risks.length ? ` Уточните: ${r.risks.join("; ")}.` : ""}`;
  };

  logAiGeneration("explain_match", Boolean(apiKey));
  if (!apiKey) return fallback();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "Ты помощник по подбору профессионального оздоровительного массажиста. Не давай медицинских советов. Кратко (2-3 предложения) объясни, почему специалист подходит, и что уточнить. Только профессиональный массаж, без интимного контекста.",
          },
          {
            role: "user",
            content: JSON.stringify({
              client: q,
              therapist: {
                name: r.profile.full_name,
                service: r.serviceRecommendation,
                reasons: r.reasons,
                risks: r.risks,
                score: r.score,
              },
            }),
          },
        ],
      }),
    });
    if (!res.ok) return fallback();
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || fallback();
  } catch {
    return fallback();
  }
}

// AI import: parse a pasted free-text bio into a structured draft.
// Deterministic heuristic fallback when OpenAI is not configured.
export async function importProfileDraft(rawText: string): Promise<{
  headline: string;
  professional_description: string;
  suggested_modalities: string[];
}> {
  const lower = rawText.toLowerCase();
  const suggested: string[] = [];
  const map: Record<string, string> = {
    классическ: "classic",
    расслаб: "relaxing",
    спортив: "sports",
    глубок: "deep_tissue",
    лимфо: "lymphatic",
    антистресс: "anti_stress",
    спин: "back",
    стоп: "foot",
    беремен: "pregnancy",
  };
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k) && !suggested.includes(v)) suggested.push(v);
  }
  const fallback = {
    headline: rawText.split(/[.\n]/)[0]?.slice(0, 90) || "Профессиональный массаж",
    professional_description: rawText.slice(0, 800),
    suggested_modalities: suggested.length ? suggested : ["classic"],
  };
  logAiGeneration("import_profile", Boolean(apiKey));
  if (!apiKey) return fallback;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Структурируй текст массажиста в JSON {headline, professional_description, suggested_modalities[]}. Только профессиональный оздоровительный массаж, удаляй любой интимный/эротический контекст.",
          },
          { role: "user", content: rawText.slice(0, 4000) },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    return {
      headline: parsed.headline || fallback.headline,
      professional_description:
        parsed.professional_description || fallback.professional_description,
      suggested_modalities:
        Array.isArray(parsed.suggested_modalities) &&
        parsed.suggested_modalities.length
          ? parsed.suggested_modalities
          : fallback.suggested_modalities,
    };
  } catch {
    return fallback;
  }
}

export function recommendationText(r: MatchResult): string {
  return `Рекомендуем услугу: ${
    r.serviceRecommendation
  } (${modalityLabel(r.profile.services?.[0]?.modality ?? "classic")}).`;
}
