import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/lib/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const cf = request.cf as IncomingRequestCfProperties | undefined;
    const context = new RouterContextProvider();
    context.set(cloudflareContext, {
      env,
      ctx,
      country: (cf?.country as string | undefined) ?? request.headers.get("cf-ipcountry"),
      colo: (cf?.colo as string | undefined) ?? null,
    });
    const response = await requestHandler(request, context);

    // Long-lived caching for fingerprinted assets is handled by Workers Assets;
    // add a few security headers to every HTML/data response.
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
