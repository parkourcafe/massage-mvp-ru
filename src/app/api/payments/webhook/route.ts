import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();

  return NextResponse.json({
    ok: true,
    received: body.length > 0,
    todo: "Verify CCBill signature formula against official documentation before production.",
  });
}

