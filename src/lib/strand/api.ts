import { NextResponse } from "next/server";
import type { UserRole } from "./types";
import { resolveRoleAccess } from "./authz";

export function legacyApiDisabled(
  area: string,
  todo: string,
  status = 410,
) {
  return NextResponse.json(
    {
      ok: false,
      disabled: true,
      area,
      message: `${area} is not active in the STRAND Phase 1 runtime foundation.`,
      todo,
    },
    { status },
  );
}

export async function requireApiRoleAccess(
  allowed: UserRole[],
  previewRole?: UserRole,
) {
  const access = await resolveRoleAccess(allowed, { previewRole });

  if (!access.hasAccess) {
    return {
      ok: false as const,
      access,
      response: NextResponse.json(
        {
          ok: false,
          error: "Access denied",
          role: access.role,
          source: access.source,
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    access,
  };
}

export async function parseJsonBody<T>(request: Request) {
  return request.json().catch(() => null) as Promise<T | null>;
}
