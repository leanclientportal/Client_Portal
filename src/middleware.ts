
import { NextResponse, type NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // logging all requests
    console.log(request.nextUrl.pathname);

    // get the active profile from the local storage
    const activeProfile = localStorage.getItem("user_activeProfile");
    const activeProfileId = localStorage.getItem("user_activeProfileId");

    console.log('activeProfile', activeProfile);
    console.log('activeProfileId', activeProfileId);

    if (!activeProfile || !activeProfileId) {
        // if there is no active profile, redirect to the login page
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // if the active profile is client, rewrite the url to /client/[activeProfileId]
    if (activeProfile === 'client') {
        return NextResponse.rewrite(new URL(`/client/${activeProfileId}${request.nextUrl.pathname}` , request.url));
    }

    // if the active profile is tenant, rewrite the url to /tenant/[activeProfileId]
    if (activeProfile === 'tenant') {
        return NextResponse.rewrite(new URL(`/tenant/${activeProfileId}${request.nextUrl.pathname}`, request.url));
    }

    // if there is no active profile, redirect to the login page
    return NextResponse.redirect(new URL('/login', request.url));
}

// See "Matching Paths" below to learn more
export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)  ',
    ],
};
