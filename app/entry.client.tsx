/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";

if (["production", "test"].includes(window.ENV.NODE_ENV as string)) {
  Sentry.init({
    dsn: window.ENV?.SENTRY_DSN,
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        if (
          url.protocol === "chrome-extension:" ||
          url.protocol === "moz-extension:"
        ) {
          // Ignore error from browser extension
          return null;
        }
      }
      return event;
    },
    tracesSampleRate: 7.0,

    integrations: [
      Sentry.browserTracingIntegration({
        useEffect,
        useLocation,
        useMatches,
      }),
    ],
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
