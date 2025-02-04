import { useEffect } from "react";
import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { NavigationProgress, nprogress } from "@mantine/nprogress";

import "@mantine/nprogress/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";

import { theme } from "./utils/mantine-config";
import { getToast } from "./utils/toast.server";
import { combineHeaders } from "./utils/http";
import { useToast } from "./utils/hooks/use-toast";
import "./tailwind.css";
import { Notifications } from "@mantine/notifications";

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
  const { toast, headers: toastHeaders } = await getToast(request);

  return data(
    {
      toast,
    },
    {
      headers: combineHeaders(toastHeaders),
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast: toastData } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state !== "idle") {
      nprogress.start();
    } else {
      nprogress.complete();
    }
  }, [navigation.state]);

  useToast(toastData);

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <NavigationProgress zIndex={9999} />
          <Notifications />
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
