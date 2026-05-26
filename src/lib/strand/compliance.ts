import type { Locale } from "@/lib/i18n/types";
import { getComplianceRuleByStateSlug } from "./data";
import { listStateComplianceRules } from "./repository";

export async function getStateDisclaimer(
  stateSlug?: string,
  citySlug?: string,
  locale: Locale = "en",
) {
  const rules = await listStateComplianceRules();
  const rule =
    rules.find((item) => item.slug === stateSlug) ??
    (stateSlug ? getComplianceRuleByStateSlug(stateSlug) : undefined);

  if (!rule) {
    return locale === "ru"
      ? "Требования платформы на уровне штатов и территорий должны быть проверены до запуска."
      : "State and territory specific platform obligations must be reviewed before launch.";
  }

  if (citySlug) {
    const cityNote = rule.cityNotes[citySlug];
    if (cityNote) {
      if (locale === "ru") {
        const localizedCityNotes: Record<string, string> = {
          sydney:
            "Формулировки для запуска в Сиднее и фильтры каталога должны быть проверены на соответствие локальным требованиям к рекламе, верификации и harm-minimisation.",
          melbourne:
            "Категорийные формулировки, дисклеймеры и report flows для Мельбурна должны быть проверены до запуска.",
        };

        return localizedCityNotes[citySlug] ?? cityNote;
      }

      return cityNote;
    }
  }

  if (locale === "ru") {
    const localizedStateDisclaimers: Record<string, string> = {
      "new-south-wales":
        "Листинги, модерация и настройки профилей для New South Wales должны быть проверены на соответствие локальным рекламным и платформенным требованиям до запуска.",
      victoria:
        "Публикация профилей и moderation workflows в Victoria могут требовать отдельной проверки на уровне штата до публичного релиза.",
      queensland:
        "Онбординг и маркетинговые раскрытия для Queensland должны быть проверены с юристом до запуска.",
      "western-australia":
        "Правила видимости листингов и escalation-требования по модерации в Western Australia требуют юридической верификации до запуска.",
    };

    return localizedStateDisclaimers[stateSlug ?? ""] ?? rule.disclaimer;
  }

  return rule.disclaimer;
}
