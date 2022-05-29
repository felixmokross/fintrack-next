import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${req.nextUrl.host}${req.nextUrl.pathname}${req.nextUrl.search}`,
      308
    );
  }
  return NextResponse.next();
}
