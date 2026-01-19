import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pdfUrl = url.searchParams.get("url");

  if (!pdfUrl) {
    return new Response("Missing PDF URL", { status: 400 });
  }

  const res = await fetch(pdfUrl);

  if (!res.ok) {
    return new Response("Failed to fetch PDF", { status: res.status });
  }

  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=preview.pdf",
    },
  });
}
