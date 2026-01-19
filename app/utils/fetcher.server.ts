export interface FetchApiOptions extends RequestInit {
  baseUrl?: string;
  responseType?: "json" | "blob" | "text";
}

class FetchApiError extends Error {
  status: number;
  statusText: string;
  errorDetails: any;

  constructor(status: number, statusText: string, errorDetails: any) {
    super(
      `${status} ${statusText}: ${JSON.stringify(errorDetails) || statusText}`,
    );
    this.status = status;
    this.statusText = statusText;
    this.errorDetails = errorDetails;
    this.name = "ApiError"; // Optional: Set a specific error name
  }
}

export function createFetchApi(defaultOptions?: FetchApiOptions) {
  return async <T = unknown, B = unknown>(
    url: string,
    options: FetchApiOptions & { body?: B } = {},
  ): Promise<T> => {
    const mergedOptions: FetchApiOptions & { body?: B } = {
      ...defaultOptions,
      ...options,
    };

    const fullUrl = mergedOptions.baseUrl
      ? `${mergedOptions.baseUrl}${url}`
      : url;

    let requestBody: BodyInit | null = null;

    if (mergedOptions.body) {
      if (mergedOptions.body instanceof FormData) {
        requestBody = mergedOptions.body;
      } else if (
        typeof mergedOptions.body === "object" &&
        !(mergedOptions.body instanceof Blob) &&
        !(mergedOptions.body instanceof ArrayBuffer)
      ) {
        requestBody = JSON.stringify(mergedOptions.body);
        if (!mergedOptions.headers?.["Content-Type"]) {
          mergedOptions.headers = {
            ...mergedOptions.headers,
            "Content-Type": "application/json",
          };
        }
      } else {
        requestBody = mergedOptions.body as BodyInit;
      }
    }

    mergedOptions.body = requestBody;
    let errorDetails: any = null;

    try {
      const response = await fetch(fullUrl, mergedOptions);

      if (!response.ok) {
        // Only read the error body ONCE and only if it's JSON:
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            errorDetails = await response.json();
          } catch (jsonError) {
            /* ignore if not json */
          }
        } else if (contentType && contentType.includes("text/")) {
          try {
            errorDetails = await response.text();
          } catch (textError) {
            /* ignore if not text */
          }
        } else {
          // Handle cases where content type is unknown
          try {
            errorDetails = await response.text();
          } catch (unknownError) {
            errorDetails = { message: "Unknown error response type." };
          }
        }

        throw response;
      }

      if (response.status === 204) {
        // No Content
        return undefined as unknown as T; // or null, depending on your needs.  Force type to T.
      }

      if (mergedOptions.responseType === "blob") {
        return (await response.blob()) as unknown as T;
      }

      if (mergedOptions.responseType === "text") {
        return (await response.text()) as unknown as T;
      }

      return (await response.json()) as T; // Default to JSON
    } catch (error: Response) {
      // More robust error handling.  Include original error.
      // console.error("FetchApiError", error);
      throw new FetchApiError(error.status, error.statusText, errorDetails);
    }
  };
}
