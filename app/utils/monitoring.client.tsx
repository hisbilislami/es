import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

export function init() {
  Sentry.init({
    dsn: window.ENV?.SENTRY_DSN,
    environment: window.ENV?.MODE,
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        if (
          url.protocol === "chrome-extension:" ||
          url.protocol === "moz-extension:"
        ) {
          // This error is from a browser extension, ignore it
          return null;
        }
      }
      return event;
    },
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.7,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
