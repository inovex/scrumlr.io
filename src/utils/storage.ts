/**
 * Saves key value pair to local storage.
 */
export const saveToStorage = (key: string, value: string): void => localStorage.setItem(key, value);

/**
 * Retrieves value from local storage by key.
 */
export const getFromStorage = (key: string): string | null => localStorage.getItem(key);

/**
 * Retrieves number from local storage by key. Returns alternative value on error.
 */
export const getNumberFromStorage = (key: string, defaultValue: number): number => JSON.parse(localStorage.getItem(key) ?? String(defaultValue)) || defaultValue;
