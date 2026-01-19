export {};

declare global {
  interface Window {
    ENV: {
      SENTRY_DSN?: string;
      [key: string]: string | undefined;
    };
  }
}
