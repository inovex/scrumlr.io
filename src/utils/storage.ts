/**
 * Saves key value pair to local storage.
 */
export const saveToStorage = (key: string, value: string): void => localStorage.setItem(key, value);

/**
 * Retrieves value from local storage by key.
 */
export function getFromStorage<T>(key: string, defaultValue: T = null as T): T {
  try {
    const value = localStorage.getItem(key);
    if (value == null) return defaultValue;
    return (typeof value === "string" ? value : JSON.parse(value)) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Retrieves number from local storage by key. Returns alternative value on error.
 */
export const getNumberFromStorage = (key: string, defaultValue: number): number => JSON.parse(localStorage.getItem(key) ?? String(defaultValue)) || defaultValue;
