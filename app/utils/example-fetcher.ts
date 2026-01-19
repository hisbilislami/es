import { createFetchApi } from "./fetcher.server";

export const jsonPlaceholderFetcher = createFetchApi({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const simpleFetch = createFetchApi();
