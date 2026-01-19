// when not used vite -> need update env vars
export const isDev = () => import.meta.env.MODE == "development";

export const stringIsEmpty = (text?: string | null): boolean =>
  typeof text !== "string" || !text.split(" ").join("").length;

/**
 * Checks if a string contains only letters, numbers, and spaces.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is valid, otherwise false.
 */
export const isValidString = (str: string): boolean => {
  const regex = /^[a-zA-Z0-9 ]*$/;
  return regex.test(str);
};

/**
 * Checks if a string contains only letters and numbers.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is valid, otherwise false.
 */
export const isValidStringWithoutSpace = (str: string): boolean => {
  const regex = /^[a-zA-Z0-9]*$/; // Removed space from regex
  return regex.test(str);
};

/**
 * Checks if the given string contains only digits and is within the specified length range.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.str - The string to be checked.
 * @param {number} [params.minLength] - The minimum length of the string (optional, default is 1).
 * @param {number} [params.maxLength=16] - The maximum length of the string (optional, default is 16).
 * @returns {boolean} - Returns true if the string is valid, otherwise false.
 */
export const isValidDigitString = ({
  str,
  minLength,
  maxLength = 16,
}: {
  str: string;
  minLength?: number;
  maxLength?: number;
}): boolean => {
  const min = typeof maxLength === "number" ? minLength ?? 1 : null;
  const regex = new RegExp(maxLength ? `^\\d{${min},${maxLength}}$` : /^\d+$/);
  return regex.test(str);
};

/**
 * Compares two objects deeply to determine if they are equal.
 * Sorts keys before comparing to ensure order does not affect the result.
 *
 * @param {any} obj1 - The first object to compare.
 * @param {any} obj2 - The second object to compare.
 * @returns {boolean} - Returns true if both objects are equal, otherwise false.
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // If both values are the same (including primitive types)
  if (obj1 === obj2) {
    return true;
  }

  // If either of them is not an object or is null, they are not equal
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // If both values are arrays, compare them as arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // If the length of the arrays is different, they are not equal
    if (obj1.length !== obj2.length) {
      return false;
    }

    // Compare each element in the arrays
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }

    return true;
  }

  // If one is an array and the other is not, they are not equal
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  // Get keys from both objects and sort them
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();

  // If the number of keys is different, the objects are not equal
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check each key in obj1
  for (const key of keys1) {
    // If the key does not exist in obj2 or the value of the key is not equal, the objects are not equal
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  // If all keys and values are equal, the objects are equal
  return true;
}
