import type { Plan, PlanId } from "./types";

const PRO_PRICE = Number(process.env.PRO_PLAN_PRICE_RUB ?? 490) || 490;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    title: "Free",
    price_rub: 0,
    period_days: 0,
    features: {
      canUseSeoIndexing: false,
      canReceiveBookings: false,
      canUseMediaFull: false,
      canUseClientCRM: false,
      canUseAnalytics: false,
      canUseManagerSupport: false,
      canUseAiImport: false,
      canUseAiMatchVisibility: false,
      canUseInternalMessaging: false,
      canUsePrivateSessionNotes: false,
    },
  },
  pro: {
    id: "pro",
    title: "Pro",
    price_rub: PRO_PRICE,
    period_days: 30,
    features: {
      canUseSeoIndexing: true,
      canReceiveBookings: true,
      canUseMediaFull: true,
      canUseClientCRM: true,
      canUseAnalytics: true,
      canUseManagerSupport: true,
      canUseAiImport: true,
      canUseAiMatchVisibility: true,
      canUseInternalMessaging: true,
      canUsePrivateSessionNotes: true,
    },
  },
  expert: {
    id: "expert",
    title: "Expert",
    price_rub: PRO_PRICE * 2,
    period_days: 30,
    features: {
      canUseSeoIndexing: true,
      canReceiveBookings: true,
      canUseMediaFull: true,
      canUseClientCRM: true,
      canUseAnalytics: true,
      canUseManagerSupport: true,
      canUseAiImport: true,
      canUseAiMatchVisibility: true,
      canUseInternalMessaging: true,
      canUsePrivateSessionNotes: true,
      canUseFeaturedPlacement: true,
      canUseExpandedAnalytics: true,
      canUsePdfProfile: true,
      canUsePrioritySupport: true,
    },
  },
};

// Free plan limits.
export const FREE_LIMITS = {
  maxMedia: 3,
  maxBookingInquiries: 3,
  maxServices: 3,
};

export type FeatureGate =
  | "canUseSeoIndexing"
  | "canReceiveBookings"
  | "canUseMediaFull"
  | "canUseClientCRM"
  | "canUseAnalytics"
  | "canUseManagerSupport"
  | "canUseAiImport"
  | "canUseAiMatchVisibility"
  | "canUseInternalMessaging"
  | "canUsePrivateSessionNotes";

export function planFor(planId: string | null | undefined): Plan {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

export function can(planId: string | null | undefined, gate: FeatureGate): boolean {
  return Boolean(planFor(planId).features[gate]);
}

export function isPro(planId: string | null | undefined): boolean {
  return planId === "pro" || planId === "expert";
}
