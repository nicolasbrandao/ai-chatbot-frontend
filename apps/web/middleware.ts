import { NextRequest, NextResponse } from "next/server";
import { ORIGIN_URL_KEY } from "@/shared/auth";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(ORIGIN_URL_KEY, request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers },
  });
}

export const runtime = "nodejs";
export const config = {
  matcher: ["/:path*"],
};
