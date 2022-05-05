import { NextResponse } from "next/server";
import { verifyToken } from "../lib/utils";

export async function middleware(req, ev) {
  const token = req ? req.cookies?.token : null;
  const userId = await verifyToken(token);
  const { pathname } = req.nextUrl.clone();
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  if (
    (token && userId) ||
    pathname.includes(`/api/login`) ||
    pathname.includes("/static")
  ) {
    return NextResponse.next();
  }

  if (!token && pathname !== `/login`) {
    return NextResponse.redirect(url);
  }
}
