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
  "/certificate/public(.*)", // Public certificate viewing route
  "/",
]);

export default clerkMiddleware(async (auth, request) => {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-User-Id",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

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

  // Add CORS headers to the response
  const response = NextResponse.next({ headers });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-Id"
  );

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
