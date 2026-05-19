// Programmatic but non-templated copy for directory landing pages
// (/therapists/[service], /therapists/[city], /therapists/[service]/[city]).
//
// Goal: turn thin/doorway pages into pages with genuinely different,
// useful text per modality family and city. Variation is deterministic
// (stable hash, no Math.random) so SSR/build output is stable and pages
// don't read as near-duplicates of each other. No medical claims — the
// platform is professional wellness/therapeutic massage only.

import { CITIES, MODALITIES, citySlug } from "./catalog";

export interface LandingContent {
  heading: string;
  paragraphs: string[];
  faq: { q: string; a: string }[];
}

export interface RelatedGroup {
  title: string;
  links: { label: string; href: string }[];
}

type Family = "relax" | "recovery" | "sport" | "special" | "format" | "city";

const FAMILY_BY_KEY: Record<string, Family> = {
  classic: "relax",
  relaxing: "relax",
  anti_stress: "relax",
  balinese: "relax",
  deep_tissue: "recovery",
  therapeutic: "recovery",
  recovery: "recovery",
  lymphatic: "recovery",
  back: "recovery",
  neck_shoulders: "recovery",
  sports: "sport",
  pregnancy: "special",
  foot: "special",
  home: "format",
  hotel_villa: "format",
  couple: "format",
};

// Small stable hash → deterministic variant selection per page.
function pick<T>(variants: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(h) % variants.length];
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function inCity(city?: string) {
  return city ? ` в городе ${city}` : "";
}

const FAMILY_COPY: Record<
  Family,
  {
    angle: string[];
    benefit: string[];
    faq: (label: string, city?: string) => { q: string; a: string }[];
  }
> = {
  relax: {
    angle: [
      "помогает снять накопленное напряжение, замедлиться и восстановить ресурс после нагруженной недели",
      "это про мягкое восстановление, спокойствие и заботу о себе без спешки",
      "подходит, когда хочется выдохнуть, снять стресс и вернуть телу ощущение лёгкости",
    ],
    benefit: [
      "Сеанс выстраивается под ваш запрос: комфортная интенсивность, спокойный темп и внимание к зонам, где напряжение ощущается сильнее всего.",
      "Специалист подбирает давление и длительность индивидуально — от лёгкой расслабляющей работы до более глубокой проработки по самочувствию.",
      "Акцент на ощущениях клиента: можно заранее обсудить предпочтения по нажиму, ароматам и продолжительности сеанса.",
    ],
    faq: (label, city) => [
      {
        q: `Как часто можно делать ${lower(label)}?`,
        a: "Для поддержания состояния обычно достаточно одного-двух сеансов в неделю, но периодичность лучше обсудить со специалистом исходя из вашего самочувствия и целей.",
      },
      {
        q: `Что взять с собой на сеанс${inCity(city)}?`,
        a: "Ничего специального не требуется. Перед сеансом стоит сообщить специалисту о самочувствии, предпочтениях по нажиму и любых противопоказаниях.",
      },
    ],
  },
  recovery: {
    angle: [
      "помогает телу восстановиться: снять зажимы, вернуть подвижность и убрать ощущение усталости в мышцах",
      "ориентирован на работу с напряжёнными зонами и общее оздоровительное восстановление",
      "это про возвращение комфорта в теле — проработку перегруженных мышц и снятие скованности",
    ],
    benefit: [
      "Перед сеансом специалист уточняет, какие зоны беспокоят, и выстраивает работу вокруг них — без обещаний «вылечить», но с вниманием к вашему комфорту.",
      "Интенсивность подбирается постепенно: важно, чтобы проработка была ощутимой, но переносимой и безопасной.",
      "Если есть заболевания или противопоказания, об этом нужно сообщить заранее — при необходимости специалист порекомендует сначала проконсультироваться с врачом.",
    ],
    faq: (label, city) => [
      {
        q: `Кому подойдёт ${lower(label)}?`,
        a: "Тем, кто чувствует усталость и скованность в мышцах после нагрузок, сидячей работы или активного дня. При наличии заболеваний предварительно проконсультируйтесь с врачом.",
      },
      {
        q: `Будет ли больно во время сеанса${inCity(city)}?`,
        a: "Проработка может быть ощутимой, но специалист ориентируется на вашу обратную связь и регулирует нажим, чтобы сеанс оставался комфортным.",
      },
    ],
  },
  sport: {
    angle: [
      "помогает подготовить мышцы к нагрузке и быстрее восстановиться после тренировок и соревнований",
      "это работа с мышцами в контексте спорта: тонус, восстановление и снятие перегрузки",
      "ориентирован на активных людей — поддержание формы и восстановление после интенсивных нагрузок",
    ],
    benefit: [
      "Сеанс можно привязать к тренировочному циклу: предсоревновательная подготовка или восстановление в дни отдыха — обсудите цель со специалистом.",
      "Внимание уделяется группам мышц, которые задействованы в вашем виде активности, и зонам, где чаще возникает перенапряжение.",
      "Темп и глубина проработки подбираются под текущую фазу нагрузки и самочувствие.",
    ],
    faq: (label, city) => [
      {
        q: `Когда лучше делать ${lower(label)} — до или после тренировки?`,
        a: "Зависит от цели: лёгкая активизация перед нагрузкой и более глубокое восстановление после. Конкретную схему лучше согласовать со специалистом.",
      },
      {
        q: `Можно ли записаться на выезд${inCity(city)}?`,
        a: "Многие специалисты на платформе работают с выездом. Доступные форматы видны в карточке профиля при выборе.",
      },
    ],
  },
  special: {
    angle: [
      "это специализированный формат, который требует отдельной подготовки и аккуратного подхода специалиста",
      "направление со своими нюансами — здесь особенно важны квалификация и опыт мастера",
      "формат, где внимание к деталям и безопасности клиента выходит на первый план",
    ],
    benefit: [
      "Обязательно заранее сообщите специалисту о своём состоянии и противопоказаниях — для таких сеансов это критично.",
      "Выбирайте специалистов с подтверждённой квалификацией: на платформе сертификаты и дипломы видны в профиле.",
      "Сеанс адаптируется под индивидуальные особенности клиента, темп и положение тела подбираются максимально бережно.",
    ],
    faq: (label, city) => [
      {
        q: `Безопасен ли ${lower(label)}?`,
        a: "При работе с квалифицированным специалистом и учёте противопоказаний — да. Сообщите о состоянии здоровья заранее и при необходимости проконсультируйтесь с врачом.",
      },
      {
        q: `Как проверить квалификацию специалиста${inCity(city)}?`,
        a: "В профиле специалиста на платформе можно посмотреть опыт, услуги и загруженные сертификаты или дипломы.",
      },
    ],
  },
  format: {
    angle: [
      "это в первую очередь про удобный формат: сеанс там и тогда, где вам комфортно",
      "формат, который подстраивается под ваш график и место — дома, в отеле или вдвоём",
      "про гибкость: вы выбираете обстановку, а специалист приезжает со всем необходимым",
    ],
    benefit: [
      "В карточке профиля указано, с какими форматами работает специалист и какие районы выезда доступны.",
      "Для выезда заранее уточните пространство и условия — специалист подскажет, что нужно подготовить.",
      "Стоимость и возможная плата за выезд видны заранее, чтобы не было неожиданностей.",
    ],
    faq: (label, city) => [
      {
        q: `Что нужно подготовить для сеанса${inCity(city)}?`,
        a: "Достаточно свободного места и спокойной обстановки. Стол, масло и расходные материалы специалист обычно привозит с собой — детали уточняются при записи.",
      },
      {
        q: `Берётся ли плата за выезд?`,
        a: "Зависит от специалиста и района. Минимальная стоимость и плата за выезд, если она есть, указаны в профиле.",
      },
    ],
  },
  city: {
    angle: [
      "собраны проверенные независимые специалисты — с профилями, услугами и подтверждённой квалификацией",
      "можно сравнить специалистов по услугам, формату работы и опыту, а затем записаться онлайн",
      "вы выбираете специалиста сами: по направлению, цене и удобному формату — без посредников",
    ],
    benefit: [
      "В каждом профиле — услуги и цены, формат работы, опыт и загруженные сертификаты, чтобы выбор был осознанным.",
      "Записаться можно прямо на платформе: переписка и согласование времени проходят в защищённой заявке.",
      "Точный адрес специалиста не публикуется и сообщается лично после подтверждённой записи.",
    ],
    faq: (label, city) => [
      {
        q: `Как выбрать массажиста${inCity(city)}?`,
        a: "Ориентируйтесь на нужное направление, формат работы, опыт и заполненность профиля. Сравните несколько специалистов и запишитесь к подходящему через платформу.",
      },
      {
        q: "Безопасно ли пользоваться платформой?",
        a: "На платформе допускаются только профессиональные оздоровительные и лечебные массажные услуги; контакты и адрес специалиста не раскрываются публично.",
      },
    ],
  },
};

const SAFETY_FAQ = {
  q: "Какие услуги допускаются на платформе?",
  a: "Только профессиональный оздоровительный и лечебный массаж. Эротический или интимный контекст запрещён правилами платформы.",
};

export function landingContent(opts: {
  modalityKey?: string;
  modalityLabel?: string;
  cityLabel?: string;
}): LandingContent {
  const { modalityKey, modalityLabel, cityLabel } = opts;
  const family: Family = modalityKey
    ? FAMILY_BY_KEY[modalityKey] ?? "recovery"
    : "city";
  const copy = FAMILY_COPY[family];
  const seed = `${modalityKey ?? "all"}|${cityLabel ?? "all"}`;

  const subject = modalityLabel ?? "Массаж";
  const place = cityLabel ? ` — ${cityLabel}` : "";

  const heading = modalityLabel
    ? pick(
        [
          `${subject}${place}: что важно знать`,
          `${subject}${place}: кому подойдёт и как выбрать`,
          `Коротко о направлении «${subject}»${place}`,
        ],
        seed
      )
    : pick(
        [
          `Массаж в городе ${cityLabel}: как выбрать специалиста`,
          `Профессиональный массаж${place ? "" : ""} в ${cityLabel}`,
          `Специалисты по массажу — ${cityLabel}`,
        ],
        seed
      );

  const lead = modalityLabel
    ? `${subject}${cityLabel ? ` в городе ${cityLabel}` : ""} ${pick(
        copy.angle,
        seed
      )}.`
    : `В подборке специалистов по массажу в городе ${cityLabel} ${pick(
        copy.angle,
        seed
      )}.`;

  const paragraphs = [lead, pick(copy.benefit, seed + "b")];

  const faq = [...copy.faq(subject, cityLabel), SAFETY_FAQ];

  return { heading, paragraphs, faq };
}

// Hand-written SEO meta descriptions per modality (keyed by modality
// `key`). Length-tuned to ~147–160 chars for Google/Yandex SERP snippets.
// Modalities without an entry fall back to the generic phrasing below.
const MODALITY_META_DESCRIPTION: Record<string, string> = {
  classic:
    "Классический массаж от проверенных частных специалистов. Расписание, отзывы, запись онлайн. Подберите массажиста вручную или с помощью AI на MassageMatch.",
  relaxing:
    "Расслабляющий массаж для снятия стресса и напряжения. Сертифицированные массажисты с гибким расписанием. Выбирайте по рейтингу и записывайтесь на MassageMatch.",
  deep_tissue:
    "Глубокотканный массаж от опытных специалистов. Работа с триггерными точками, снятие хронического напряжения. Проверенные профили с отзывами на MassageMatch.",
  sports:
    "Спортивный массаж для восстановления после тренировок и подготовки к соревнованиям. Частные массажисты с опытом работы со спортсменами. Запись на MassageMatch.",
  balinese:
    "Балийский массаж — мягкая техника с элементами акупрессуры и ароматерапии. Найдите специалиста с подтверждённым опытом и запишитесь через MassageMatch.",
  lymphatic:
    "Лимфодренажный массаж для снятия отёков, улучшения лимфотока и детоксикации. Квалифицированные специалисты с медицинским образованием. Запись на MassageMatch.",
  neck_shoulders:
    "Массаж шейно-воротниковой зоны — снятие боли и напряжения в шее и плечах. Частные массажисты с выездом или в кабинете. Онлайн-запись и AI-подбор на MassageMatch.",
  back:
    "Массаж спины от проверенных специалистов. Классический, лечебный или глубокотканный — подберите технику и мастера под свой запрос. Запись онлайн на MassageMatch.",
  pregnancy:
    "Массаж для беременных от специалистов с подтверждённой квалификацией. Безопасные техники для каждого триместра. Только проверенные профили на MassageMatch.",
};

export function modalityMetaDescription(
  modalityKey: string,
  modalityLabel: string
): string {
  return (
    MODALITY_META_DESCRIPTION[modalityKey] ??
    `Профессиональные специалисты: ${modalityLabel}.`
  );
}

// Internal-linking blocks for landing pages: strengthen crawl paths and
// give users relevant next steps (same-family services, the service in
// other cities, other services in the same city).
export function relatedLinks(opts: {
  modalityKey?: string;
  cityLabel?: string;
}): RelatedGroup[] {
  const { modalityKey, cityLabel } = opts;

  // Hub (/therapists): link out to every modality and city so crawlers
  // reach all landing pages from the catalog root in one hop.
  if (!modalityKey && !cityLabel) {
    return [
      {
        title: "Виды массажа",
        links: MODALITIES.map((m) => ({
          label: m.label,
          href: `/therapists/${m.slug}`,
        })),
      },
      {
        title: "Города",
        links: CITIES.map((c) => ({
          label: c.label,
          href: `/therapists/${c.slug}`,
        })),
      },
    ];
  }

  const cSlug = citySlug(cityLabel);
  const self = modalityKey
    ? MODALITIES.find((m) => m.key === modalityKey)
    : undefined;
  const family = modalityKey ? FAMILY_BY_KEY[modalityKey] : undefined;
  const sameFamily = MODALITIES.filter(
    (m) => m.key !== modalityKey && FAMILY_BY_KEY[m.key] === family
  );
  const others = MODALITIES.filter((m) => m.key !== modalityKey);
  const groups: RelatedGroup[] = [];

  if (self && cSlug && cityLabel) {
    groups.push({
      title: `${self.label} в других городах`,
      links: CITIES.filter((c) => c.slug !== cSlug).map((c) => ({
        label: c.label,
        href: `/therapists/${self.slug}/${c.slug}`,
      })),
    });
    groups.push({
      title: `Другие услуги в городе ${cityLabel}`,
      links: [...sameFamily, ...others]
        .filter((m, i, a) => a.indexOf(m) === i)
        .slice(0, 8)
        .map((m) => ({
          label: m.label,
          href: `/therapists/${m.slug}/${cSlug}`,
        })),
    });
    return groups;
  }

  if (self) {
    groups.push({
      title: `${self.label} по городам`,
      links: CITIES.map((c) => ({
        label: c.label,
        href: `/therapists/${self.slug}/${c.slug}`,
      })),
    });
    if (sameFamily.length) {
      groups.push({
        title: "Похожие виды массажа",
        links: sameFamily.slice(0, 6).map((m) => ({
          label: m.label,
          href: `/therapists/${m.slug}`,
        })),
      });
    }
    return groups;
  }

  if (cSlug && cityLabel) {
    groups.push({
      title: `Виды массажа — ${cityLabel}`,
      links: MODALITIES.slice(0, 10).map((m) => ({
        label: m.label,
        href: `/therapists/${m.slug}/${cSlug}`,
      })),
    });
    groups.push({
      title: "Другие города",
      links: CITIES.filter((c) => c.slug !== cSlug).map((c) => ({
        label: c.label,
        href: `/therapists/${c.slug}`,
      })),
    });
  }
  return groups;
}
