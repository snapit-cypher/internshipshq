import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.internshipshq.com";
const NON_WWW_HOST = "internshipshq.com";

export function middleware(req: NextRequest) {
	const host = req.headers.get("host") || "";
	const { pathname, search } = req.nextUrl;

	if (host === NON_WWW_HOST) {
		const url = new URL(`https://${CANONICAL_HOST}${pathname}${search}`);
		return NextResponse.redirect(url, 308);
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/:path*",
};
