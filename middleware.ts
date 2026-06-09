import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const PUBLIC_ROUTES = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const session = req.cookies.get("session")?.value;

  if (!session) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await adminAuth.verifySessionCookie(session, true);

    if (isPublic) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
