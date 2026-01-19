import { MetaMatches } from "@remix-run/react/dist/routeModules";

export const createMetaTitle = ({
  matches,
  title,
}: {
  matches: MetaMatches;
  title: string;
}) => {
  const rootMeta = matches.find((m) => m.id === "root")?.meta[0] ?? {};

  return `${rootMeta?.title ?? ""} | ${title}`;
};
