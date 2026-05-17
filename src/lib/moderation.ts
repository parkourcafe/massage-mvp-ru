// Professional-boundaries moderation.
// This platform is for professional wellness / therapeutic massage ONLY.
// We block obvious adult/erotic wording and flag suspicious titles and
// unsafe medical claims for manual review.

export type ModerationCategory =
  | "adult"
  | "erotic"
  | "suspicious_title"
  | "inappropriate_photo"
  | "unsafe_medical";

export interface ModerationHit {
  category: ModerationCategory;
  severity: "block" | "review";
  matchedText: string;
}

export interface ModerationResult {
  ok: boolean; // false when any "block" hit exists
  hits: ModerationHit[];
}

// Hard-block adult / erotic wording (RU + EN, incl. common transliterations).
const ADULT_BLOCK = [
  "эрот",
  "эроти",
  "интим",
  "интимн",
  "секс",
  "sex",
  "erotic",
  "sensual massage",
  "чувственный массаж",
  "ню",
  "nude",
  "голый",
  "обнаж",
  "стрип",
  "strip",
  "тантрический интим",
  "body to body",
  "боди ту боди",
  "боди-массаж интим",
  "happy ending",
  "хэппи энд",
  "хеппи энд",
  "релакс для двоих интим",
  "спецуслуг",
  "special service",
  "vip досуг",
  "досуг",
  "эскорт",
  "escort",
  "адал",
  "adult",
  "18+",
  "playboy",
  "intimate",
];

// Suspicious phrasing — not auto-blocked, but flagged for manual review.
const SUSPICIOUS_REVIEW = [
  "только для мужчин",
  "только мужчинам",
  "приятное завершение",
  "полный релакс без границ",
  "без табу",
  "анкета",
  "выезд ночью",
  "ночной выезд",
  "круглосуточно для двоих",
  "приватный танец",
];

// Medical claims that require qualification — flag for review.
const UNSAFE_MEDICAL = [
  "лечу",
  "вылечу",
  "гарантирую излечение",
  "100% излечение",
  "вылечивает рак",
  "лечит рак",
  "заменяет операцию",
  "заменяет врача",
  "ставлю диагноз",
  "поставлю диагноз",
  "гарантированно вылечивает",
  "медицинская гарантия выздоровления",
  "cure cancer",
  "guaranteed cure",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/[^a-zа-я0-9+ ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function moderateText(
  raw: string | null | undefined,
  opts: { context?: "title" | "text" } = {}
): ModerationResult {
  const hits: ModerationHit[] = [];
  if (!raw) return { ok: true, hits };
  const text = normalize(raw);

  for (const term of ADULT_BLOCK) {
    if (text.includes(term)) {
      hits.push({
        category: term === "адал" || term === "adult" || term === "18+" ? "adult" : "erotic",
        severity: "block",
        matchedText: term,
      });
    }
  }

  for (const term of SUSPICIOUS_REVIEW) {
    if (text.includes(term)) {
      hits.push({
        category: "suspicious_title",
        severity: "review",
        matchedText: term,
      });
    }
  }

  for (const term of UNSAFE_MEDICAL) {
    if (text.includes(term)) {
      hits.push({
        category: "unsafe_medical",
        severity: "review",
        matchedText: term,
      });
    }
  }

  // De-duplicate by category+matchedText
  const seen = new Set<string>();
  const deduped = hits.filter((h) => {
    const k = `${h.category}:${h.matchedText}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { ok: !deduped.some((h) => h.severity === "block"), hits: deduped };
}

// Moderate a whole therapist profile payload (name, description, services,
// media titles). Returns the combined result used by the moderation queue.
export function moderateProfilePayload(input: {
  full_name?: string | null;
  headline?: string | null;
  professional_description?: string | null;
  safety_boundaries?: string | null;
  services?: { title?: string | null; description?: string | null }[];
  media?: { title?: string | null; description?: string | null; alt_text?: string | null }[];
}): ModerationResult {
  const parts: { text: string; ctx: "title" | "text" }[] = [
    { text: input.full_name ?? "", ctx: "title" },
    { text: input.headline ?? "", ctx: "title" },
    { text: input.professional_description ?? "", ctx: "text" },
    { text: input.safety_boundaries ?? "", ctx: "text" },
  ];
  for (const s of input.services ?? []) {
    parts.push({ text: s.title ?? "", ctx: "title" });
    parts.push({ text: s.description ?? "", ctx: "text" });
  }
  for (const m of input.media ?? []) {
    parts.push({ text: `${m.title ?? ""} ${m.description ?? ""} ${m.alt_text ?? ""}`, ctx: "text" });
  }

  const allHits: ModerationHit[] = [];
  for (const p of parts) {
    const r = moderateText(p.text, { context: p.ctx });
    allHits.push(...r.hits);
  }

  const seen = new Set<string>();
  const deduped = allHits.filter((h) => {
    const k = `${h.category}:${h.matchedText}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { ok: !deduped.some((h) => h.severity === "block"), hits: deduped };
}
