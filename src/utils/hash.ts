/**
 * Generates a fixed hash number for any given string.
 * @param s the string to hash
 * @returns the hash code
 */
export const hashCode = (s: string) => {
  let hash = 0;
  const stringLength = s.length;
  let i = 0;
  if (stringLength > 0) {
    while (i < stringLength) {
      // eslint-disable-next-line no-bitwise
      hash = ((hash << 5) - hash + s.charCodeAt(i++)) | 0;
    }
  }
  return Math.abs(hash);
};
