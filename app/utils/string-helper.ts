import cuid2 from "@paralleldrive/cuid2";
import mime from "mime-types";

export const convertFileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function convertBase64ToFile({
  base64,
  mimeType = "image/png",
  prefixName = "file",
}: {
  base64: string;
  mimeType?: string;
  prefixName?: string;
}) {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType }); // Adjust type if needed (e.g., image/jpeg)

  // Create a file from the Blob
  const ext = mime.extension(mimeType);
  const fileName = `${prefixName}_${cuid2.createId()}.${ext}`;
  const file = new File([blob], fileName, { type: mimeType });

  return { blob, file };
}

export function removeMimeFromBase64(base64String: string): string {
  const mimePrefixPattern: RegExp = /^data:[a-z]+\/[a-z]+;base64,/;
  return base64String.replace(mimePrefixPattern, "");
}

export const isStringEmpty = (text?: string | null): boolean =>
  typeof text !== "string" || !text.split(" ").join("").length;

/**
 * Converts an object to a query string.
 *
 * @param params - The object to be converted.
 * @returns The query string.
 */
export function toQueryString(params: Record<string, unknown>): string {
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (value === true) {
        // If value is boolean true, include only the key
        return `${encodeURIComponent(key)}`;
      } else if (value === false || value === undefined || value === null) {
        // Ignore false, undefined, or null values
        return "";
      } else if (value instanceof Date) {
        // Convert Date to ISO string
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          value.toISOString().split("T")[0],
        )}`;
      } else {
        // Convert other values to strings
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          String(value),
        )}`;
      }
    })
    .filter((param) => param !== "") // Filter out empty strings
    .join("&");

  return queryString ? `?${queryString}` : "";
}

export async function getBase64FromUrl(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${response.headers.get("content-type")};base64,${base64}`;
}
