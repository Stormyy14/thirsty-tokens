import { createContext } from "react-router";

export interface CloudflareContext {
  env: Env;
  ctx: ExecutionContext;
  /** Visitor's ISO country code from Cloudflare's edge, when known. */
  country: string | null;
  colo: string | null;
}

export const cloudflareContext = createContext<CloudflareContext | null>(null);
