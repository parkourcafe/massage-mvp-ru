"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocaleMessages } from "./LocaleProvider";

export function AgeGateCard() {
  const [declined, setDeclined] = useState(false);
  const { locale } = useLocaleMessages();
  const copy =
    locale === "ru"
      ? {
          declinedEyebrow: "Доступ отклонён",
          declinedTitle: "Платформа доступна только для совершеннолетних.",
          declinedBody:
            "STRAND предназначен только для посетителей 18+. Если это не относится к вам, пожалуйста, покиньте сайт.",
          exitSite: "Покинуть сайт",
          eyebrow: "Подтверждение возраста",
          title: "Подтвердите, что вам 18+, чтобы продолжить.",
          body:
            "STRAND показывает 18+ профили в профессиональной и модерируемой среде. Продолжая, вы подтверждаете, что вам не менее 18 лет и вы будете использовать платформу законно и уважительно.",
          accept: "Мне 18 или больше",
          decline: "Мне меньше 18",
        }
      : {
          declinedEyebrow: "Access declined",
          declinedTitle: "This platform is for adults only.",
          declinedBody:
            "STRAND is restricted to visitors aged 18 or older. If this does not apply, please exit the site.",
          exitSite: "Exit site",
          eyebrow: "Age confirmation",
          title: "Confirm you are 18+ to continue.",
          body:
            "STRAND presents adult companion profiles in a professional, moderation-led environment. By continuing, you confirm you are at least 18 years old and agree to use the platform lawfully and respectfully.",
          accept: "I am 18 or older",
          decline: "I am under 18",
        };

  if (declined) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-soft">
        <p className="eyebrow justify-center">{copy.declinedEyebrow}</p>
        <h1 className="mt-4 text-4xl text-heading">{copy.declinedTitle}</h1>
        <p className="mt-4 text-sm leading-7 text-body">
          {copy.declinedBody}
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="https://www.google.com" className="btn-secondary">
            {copy.exitSite}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-soft">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="mt-4 text-4xl text-heading sm:text-5xl">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-body sm:text-base">
        {copy.body}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          {copy.accept}
        </Link>
        <button type="button" className="btn-secondary" onClick={() => setDeclined(true)}>
          {copy.decline}
        </button>
      </div>
    </div>
  );
}
