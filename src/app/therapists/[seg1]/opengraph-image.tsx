import { CITY_BY_SLUG, MODALITY_BY_SLUG } from "@/lib/catalog";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  createOGImage,
} from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "MassageMatch";

// Per-modality OG copy. Keyed by modality `key`; title may differ from
// the catalog label for a punchier social card (e.g. neck_shoulders).
const MODALITY_OG: Record<string, { title: string; subtitle: string }> = {
  classic: {
    title: "Классический массаж",
    subtitle: "Проверенные специалисты · Расписание · Отзывы",
  },
  relaxing: {
    title: "Расслабляющий массаж",
    subtitle: "Снятие стресса и напряжения · Гибкое расписание",
  },
  deep_tissue: {
    title: "Глубокотканный массаж",
    subtitle: "Триггерные точки · Хроническое напряжение",
  },
  sports: {
    title: "Спортивный массаж",
    subtitle: "Восстановление · Подготовка к соревнованиям",
  },
  balinese: {
    title: "Балийский массаж",
    subtitle: "Акупрессура · Ароматерапия · Расслабление",
  },
  lymphatic: {
    title: "Лимфодренажный массаж",
    subtitle: "Снятие отёков · Детоксикация · Лимфоток",
  },
  neck_shoulders: {
    title: "Массаж шеи и плеч",
    subtitle: "Шейно-воротниковая зона · Снятие боли",
  },
  back: {
    title: "Массаж спины",
    subtitle: "Классический · Лечебный · Глубокотканный",
  },
  pregnancy: {
    title: "Массаж для беременных",
    subtitle: "Безопасные техники · Квалифицированные специалисты",
  },
};

export default function OgImage({
  params,
}: {
  params: { seg1: string };
}) {
  const modality = MODALITY_BY_SLUG.get(params.seg1);
  if (modality) {
    const og = MODALITY_OG[modality.key] ?? {
      title: modality.label,
      subtitle: "Независимые проверенные специалисты",
    };
    return createOGImage(og.title, og.subtitle);
  }

  const city = CITY_BY_SLUG.get(params.seg1);
  if (city) {
    return createOGImage(
      `Массаж — ${city.label}`,
      "Независимые профессиональные массажисты с расписанием"
    );
  }

  return createOGImage(
    "MassageMatch",
    "Независимые профессиональные массажисты"
  );
}
