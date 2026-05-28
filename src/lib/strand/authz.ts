import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "@/lib/supabase";
import type { UserRole } from "./types";
import {
  getStrandRoleForUser,
  getSupabaseAuthUserFromCookies,
} from "./supabase-auth";

export const STRAND_PREVIEW_ROLE_COOKIE = "strand_preview_role";
export const STRAND_USER_ID_COOKIE = "strand_user_id";

const USER_ROLES: UserRole[] = [
  "guest",
  "client",
  "model",
  "kyc_reviewer",
  "support",
  "admin",
];

export interface AppUserContext {
  userId: string | null;
  role: UserRole;
  source: "database" | "preview" | "anonymous";
  isPreview: boolean;
}

export interface RoleAccessResult extends AppUserContext {
  allowed: UserRole[];
  hasAccess: boolean;
}

function toUserRole(value: string | undefined | null): UserRole | null {
  if (!value) return null;
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

function previewAccessDisabled() {
  return (
    isSupabaseAuthConfigured ||
    process.env.STRAND_DISABLE_PREVIEW_ACCESS === "true"
  );
}

async function resolveDatabaseRole(userId: string) {
  return getStrandRoleForUser(userId);
}

// Preview access keeps role-gated sections explorable only when live auth
// is not configured. Production can also disable it explicitly.
export async function getAppUserContext(previewRole?: UserRole): Promise<AppUserContext> {
  const store = cookies();
  const authUser = await getSupabaseAuthUserFromCookies();
  const cookieUserId = store.get(STRAND_USER_ID_COOKIE)?.value ?? null;
  const userId = authUser?.id ?? cookieUserId;

  if (userId) {
    const dbRole = await resolveDatabaseRole(userId);
    if (dbRole) {
      return {
        userId,
        role: dbRole,
        source: "database",
        isPreview: false,
      };
    }

    if (authUser?.id) {
      return {
        userId: authUser.id,
        role: "guest",
        source: "database",
        isPreview: false,
      };
    }
  }

  const explicitPreviewRole =
    toUserRole(store.get(STRAND_PREVIEW_ROLE_COOKIE)?.value) ??
    toUserRole(process.env.STRAND_PREVIEW_ROLE);

  if (!previewAccessDisabled() && explicitPreviewRole) {
    return {
      userId: userId ?? `preview-${explicitPreviewRole}`,
      role: explicitPreviewRole,
      source: "preview",
      isPreview: true,
    };
  }

  if (!previewAccessDisabled() && previewRole) {
    return {
      userId: `preview-${previewRole}`,
      role: previewRole,
      source: "preview",
      isPreview: true,
    };
  }

  return {
    userId,
    role: "guest",
    source: "anonymous",
    isPreview: false,
  };
}

export async function resolveRoleAccess(
  allowed: UserRole[],
  options?: { previewRole?: UserRole },
): Promise<RoleAccessResult> {
  const context = await getAppUserContext(options?.previewRole);

  return {
    ...context,
    allowed,
    hasAccess: allowed.includes(context.role),
  };
}

export function formatRoleLabel(role: UserRole) {
  switch (role) {
    case "client":
      return "Client";
    case "model":
      return "Model";
    case "kyc_reviewer":
      return "KYC reviewer";
    case "support":
      return "Support";
    case "admin":
      return "Admin";
    default:
      return "Guest";
  }
}
