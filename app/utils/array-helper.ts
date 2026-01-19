/**
 *
 * @param prev - the existing array
 * @param newItems - the new array to be merged
 * @param key - the key to be used for comparison
 * @returns
 */
export const mergeArrays = <T>(prev: T[], newItems: T[], key: keyof T): T[] => {
  const existingIds = new Set(prev.map((item) => item[key]));
  const filteredNewItems = newItems.filter(
    (item) => !existingIds.has(item[key]),
  );
  return [...prev, ...filteredNewItems];
};
