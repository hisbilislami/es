import { RefObject } from "./object-helpers.types";

export const omitObject: (
  obj: Record<string, any>,
  strs?: string[],
) => Record<string, any> = (obj, strs = []) => {
  if (!strs.length || !Object.keys(obj).length) {
    return obj;
  }

  let respObj: Record<string, any> = obj;

  const omitWithoutNested = strs.filter((e) => !e.includes("."));
  const omitWithNested = strs.filter((e) => e.includes("."));

  if (!!omitWithoutNested.length) {
    respObj = Object.keys(obj).reduce((prev, key) => {
      if (omitWithoutNested.includes(key)) return prev;

      return { ...prev, [key]: obj[key] };
    }, {});
  }

  for (const dt of omitWithNested) {
    let curObj: Record<string, any> = respObj;
    const keys = dt.split(".");
    const lastKey = keys.pop();
    // loop keys for collect values
    for (const key of keys.slice(0, keys.length)) {
      // set current value
      curObj =
        typeof curObj == "object"
          ? curObj[Array.isArray(curObj) ? Number(key) : key]
          : undefined;
    }

    // remove row array based index
    if (Array.isArray(curObj)) {
      // update array
      curObj = curObj.filter((_, i) => i != Number(lastKey));

      //   set array on  parents keys
      let nestedDown: string[] = [];
      let targetArrChanges = respObj;
      const lastKeyArr = keys.pop();

      while (nestedDown.length < keys.length) {
        const key = keys[nestedDown.length];

        targetArrChanges = targetArrChanges[key];
        nestedDown = [...nestedDown, key];
      }

      targetArrChanges[lastKeyArr!] = curObj;
    }

    // remove data based keys
    else if (
      lastKey &&
      curObj &&
      (curObj[lastKey] ||
        ["boolean", "number"].includes(typeof curObj[lastKey]))
    ) {
      delete curObj[lastKey];
    }
  }

  return respObj;
};

// Function to transform the refs object to the desired format
export function transformFormDataNested(refs: RefObject): RefObject {
  const result: RefObject = {};

  // Helper function to set a nested value in an object
  function setNestedValue(d: RefObject, keys: (string | number)[], value: any) {
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!d[key]) {
        d[key] = typeof keys[i + 1] === "number" ? [] : {};
      }
      d = d[key];
    }
    d[keys[keys.length - 1]] = value;
  }

  // Parse the keys and set the values in the result object
  Object.entries(refs).forEach(([fullKey, value]) => {
    const keys: (string | number)[] = [];
    let buffer = "";
    let inBracket = false;

    for (const char of fullKey) {
      if (char === "[") {
        if (buffer) keys.push(buffer);
        buffer = "";
        inBracket = true;
      } else if (char === "]") {
        if (buffer) keys.push(isNaN(+buffer) ? buffer : +buffer);
        buffer = "";
        inBracket = false;
      } else {
        buffer += char;
      }
    }

    if (buffer) keys.push(buffer);
    setNestedValue(result, keys, value);
  });

  return result;
}

/**
 * Converts an object to a query string.
 *
 * @param params - The object to be converted.
 * @returns The query string.
 */
export function toQueryString(params: Record<string, any>): string {
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
