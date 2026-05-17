// Canonical catalog for the massage marketplace.
// Professional wellness / therapeutic massage only.

export type Modality = {
  key: string;
  label: string;
  slug: string; // used in /therapists/[service]
};

export const MODALITIES: Modality[] = [
  { key: "classic", label: "Классический массаж", slug: "klassicheskiy" },
  { key: "relaxing", label: "Расслабляющий массаж", slug: "rasslablyayushchiy" },
  { key: "deep_tissue", label: "Глубокотканный массаж", slug: "glubokotkannyy" },
  { key: "sports", label: "Спортивный массаж", slug: "sportivnyy" },
  { key: "balinese", label: "Балийский массаж", slug: "baliyskiy" },
  { key: "lymphatic", label: "Лимфодренажный массаж", slug: "limfodrenazhnyy" },
  { key: "anti_stress", label: "Антистресс массаж", slug: "antistress" },
  { key: "back", label: "Массаж спины", slug: "spiny" },
  { key: "neck_shoulders", label: "Массаж шейно-воротниковой зоны", slug: "shei-i-plech" },
  { key: "foot", label: "Массаж стоп", slug: "stop" },
  { key: "pregnancy", label: "Массаж для беременных", slug: "dlya-beremennyh" },
  { key: "recovery", label: "Восстановительный массаж", slug: "vosstanovitelnyy" },
  { key: "therapeutic", label: "Лечебно-оздоровительный массаж", slug: "lechebnyy" },
  { key: "couple", label: "Парный массаж", slug: "parnyy" },
  { key: "home", label: "Массаж на дому", slug: "na-domu" },
  { key: "hotel_villa", label: "Массаж в отеле / на вилле", slug: "v-otele" },
];

export const MODALITY_BY_KEY = new Map(MODALITIES.map((m) => [m.key, m]));
export const MODALITY_BY_SLUG = new Map(MODALITIES.map((m) => [m.slug, m]));

export function modalityLabel(key: string): string {
  return MODALITY_BY_KEY.get(key)?.label ?? key;
}

export const CITIES = [
  { slug: "moskva", label: "Москва" },
  { slug: "sankt-peterburg", label: "Санкт-Петербург" },
  { slug: "sochi", label: "Сочи" },
  { slug: "kazan", label: "Казань" },
  { slug: "ekaterinburg", label: "Екатеринбург" },
  { slug: "novosibirsk", label: "Новосибирск" },
];

export const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));
export const CITY_BY_LABEL = new Map(CITIES.map((c) => [c.label.toLowerCase(), c]));

export function citySlug(label: string | null | undefined): string | null {
  if (!label) return null;
  return CITY_BY_LABEL.get(label.toLowerCase())?.slug ?? null;
}

export const DURATIONS = [30, 60, 90, 120];

export const LANGUAGES = [
  "Русский",
  "Английский",
  "Немецкий",
  "Французский",
  "Испанский",
  "Турецкий",
];

export const PRESSURE_OPTIONS = [
  { key: "soft", label: "Мягкое" },
  { key: "medium", label: "Среднее" },
  { key: "strong", label: "Сильное" },
  { key: "not_sure", label: "Не уверен(а)" },
];

export const LOCATION_TYPES = [
  { key: "client_home", label: "У клиента дома" },
  { key: "hotel", label: "Отель" },
  { key: "villa", label: "Вилла" },
  { key: "therapist_place", label: "У специалиста" },
  { key: "salon", label: "Салон / студия" },
  { key: "discuss", label: "Обсудить" },
];

export const CONTACT_METHODS = ["Telegram", "WhatsApp", "phone", "email", "none"];

export const SUPPORT_TOPICS = [
  "Помочь заполнить профиль",
  "Помочь загрузить сертификаты",
  "Помочь оформить услуги",
  "Проблема с записью",
  "Проблема с оплатой",
  "Проблема с публикацией",
  "Хочу подключить тариф",
  "Другое",
];

export const VIDEO_PROVIDERS = ["YouTube", "VK Video", "Rutube", "Vimeo"];

export const SAFETY_RULES = [
  "Только профессиональный оздоровительный и лечебный массаж.",
  "Запрещён эротический / интимный / сексуальный контент.",
  "Запрещены провокационные фотографии.",
  "Запрещён обнажённый или полуобнажённый контент.",
  "Запрещены формулировки про «спецуслуги».",
  "Запрещены фотографии клиентов без их согласия.",
  "Запрещены медицинские заявления без подтверждённой квалификации.",
  "Где необходимо — указывается медицинский дисклеймер.",
];

export const PLATFORM_NOTICE =
  "На платформе допускаются только профессиональные оздоровительные и лечебные массажные услуги.";

export const MEDICAL_DISCLAIMER =
  "Информация на платформе не является медицинской консультацией. При наличии заболеваний и противопоказаний проконсультируйтесь с врачом.";
