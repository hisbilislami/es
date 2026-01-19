/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import chalk from "chalk";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

import { scheduleJob } from "./task/schedule-job.server";

const SENTRY_DSN = process.env.SENTRY_DSN;
if (
  SENTRY_DSN &&
  (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test")
) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0,
    // The Prisma integration is currently commented out due to an unresolved issue
    // in the Sentry SDK related to how it handles Prisma instrumentation.
    // Reference: https://github.com/getsentry/sentry-javascript/issues/11216
    //
    // When enabled, this integration causes unexpected behavior in the server response,
    // particularly with Turbo Stream responses, leading to decoding errors.
    //
    // This issue is present in production but does not occur in local development,
    // indicating a possible difference in runtime environments.
    //
    // Until an official fix is released by Sentry, we have temporarily disabled the Prisma integration
    // to ensure proper server functionality.
    //
    // To track progress on this issue, monitor the linked GitHub discussion above.
    //
    // Uncomment the following block once Sentry provides a fix.

    /* integrations: */
    /*   process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" */
    /*     ? [ */
    /*         Sentry.prismaIntegration({ */
    /*           prismaInstrumentation: new PrismaInstrumentation(), */
    /*         }), */
    /*       ] */
    /*     : [], */
  });
}

scheduleJob()
  .then(() => console.log("🎯 Scheduler job registered on startup."))
  .catch((err) => console.error("⚠️ Failed to register scheduler job:", err));

export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
): void {
  // Skip capturing if the request is aborted as Remix docs suggest
  // Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
  if (request.signal.aborted) {
    return;
  }
  if (error instanceof Error) {
    console.error(chalk.red(error.stack));
    void Sentry.captureException(error);
  } else {
    console.error(error);
    Sentry.captureException(error);
  }
}

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
