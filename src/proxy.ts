import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE } from "./lib/constants";

const intl = createIntlMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: English only, no locale routing. Cheap cookie presence check
  // here; the real session validation happens in the admin layout and in
  // every Server Action (see src/lib/auth.ts).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!request.cookies.has(SESSION_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const response = intl(request);

  // next-intl expresses the default-locale rewrite (/about -> /en/about) as an
  // absolute URL. Next.js normalises loopback hosts to "localhost" in that URL
  // but validates it against the literal address the server is bound to, so a
  // server started with HOSTNAME=127.0.0.1 treats the rewrite as external and
  // the English routes loop. The same rewrite is declared path-based in
  // next.config.ts, so the header is dropped and the request continues with
  // next-intl's locale headers intact.
  if (response.headers.has("x-middleware-rewrite")) {
    response.headers.delete("x-middleware-rewrite");
    response.headers.set("x-middleware-next", "1");
  }
  return response;
}

export const config = {
  // Skip Next internals, uploads, API routes and any path with a file extension.
  matcher: ["/((?!api|uploads|_next|_vercel|.*\\..*).*)"],
};
