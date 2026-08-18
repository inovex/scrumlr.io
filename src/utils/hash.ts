/**
 * Generates a fixed hash number for any given string.
 * @param s the string to hash
 * @returns the hash code
 */
export const hashCode = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    // Math.imul wraps `hash * 31` to a 32 bit integer, which keeps the hash stable and bounded
    hash = Math.imul(hash, 31) + (s.codePointAt(i) ?? 0);
  }
  // imul with 1 wraps the final addition to 32 bits as well
  return Math.abs(Math.imul(hash, 1));
};
