import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  data,
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect } from "react";
import "dayjs/locale/id";

import "@mantine/nprogress/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import DialogMessage from "./components/dialog/dialog-message";
import GeneralErrorBoundary from "./components/error-boundary/general-error-boundary";
import { DialogProvider, useDialog } from "./context/DialogContext";
import { getDialog } from "./utils/dialog.server";
import { combineHeaders } from "./utils/http";
import { theme } from "./utils/mantine-config";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    {
      title: "E-Sign",
    },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { dialog, headers: dialogHeaders } = await getDialog(request);

  return data(
    {
      dialog,
      ENV: {
        SENTRY_DSN: process.env.SENTRY_DSN,
        NODE_ENV: process.env.NODE_ENV,
      },
    },
    {
      headers: combineHeaders(dialogHeaders),
    },
  );
};

function ShowServerDialog() {
  const data = useLoaderData<typeof loader>();

  const dialog = data?.dialog ?? null;
  const { showDialog } = useDialog();

  useEffect(() => {
    if (dialog) {
      showDialog({
        title: dialog.title,
        description: dialog.description,
        icon: dialog.icon,
        type: dialog.type,
        confirmText: dialog.confirmText,
      });
    }
  }, [dialog, showDialog]);

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const ENV = data?.ENV ?? {};
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state !== "idle") {
      nprogress.start();
    } else {
      nprogress.complete();
    }
  }, [navigation.state]);

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        {/* Inject ENV variables into window.ENV */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="overflow-hidden">
        <DialogProvider>
          <MantineProvider theme={theme}>
            <DatesProvider settings={{ locale: "id" }}>
              <NavigationProgress zIndex={9999} />
              <Notifications />
              <DialogMessage />
              <ShowServerDialog />
              {children}
            </DatesProvider>
          </MantineProvider>
        </DialogProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
