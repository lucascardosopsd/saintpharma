import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/course(.*)",
  "/studio(.*)",
  "/api(.*)",
  "/privacy-policy",
  "/consent-terms", // Added this route as public
  "/",
]);

export default clerkMiddleware(async (auth, request) => {
  // Check if the current path is a public route
  const isPublic = isPublicRoute(request);

  // For non-public routes, protect with authentication
  if (!isPublic) {
    // This will handle authentication protection
    await auth.protect();
  }

  // Add the current path to headers for potential use in components
  const headers = new Headers(request.headers);
  headers.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({ headers });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
