import { useState } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { Waves } from "./components/Waves";
import { WaterLevelContext } from "./lib/water-level";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020a18" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [level, setLevel] = useState(0.12);
  return (
    <WaterLevelContext value={setLevel}>
      <Waves level={level} />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </WaterLevelContext>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something sprang a leak";
  let details = "An unexpected error occurred. Try again in a moment.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 — this page evaporated";
      details = "We looked everywhere, even behind the cooling towers.";
    } else {
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <>
      <Waves level={0.1} />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <div className="animate-bob text-7xl" aria-hidden>
            🏜️
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold text-white">{title}</h1>
          <p className="mt-3 text-foam/80">{details}</p>
          <Link to="/" className="btn-primary mt-8">
            Back to the water
          </Link>
          {stack && (
            <pre className="mt-10 w-full overflow-x-auto rounded-2xl bg-black/40 p-4 text-left text-xs">
              <code>{stack}</code>
            </pre>
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
