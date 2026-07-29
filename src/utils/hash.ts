/**
 * Generates a fixed hash number for any given string.
 * @param s the string to hash
 * @returns the hash code
 */
export const hashCode = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    // Math.imul keeps `hash * 31` within 32-bit integer arithmetic, so the hash stays stable and bounded
    hash = Math.imul(hash, 31) + s.charCodeAt(i);
  }
  // Math.imul(x, 1) truncates the final addition to a 32-bit integer as well
  return Math.abs(Math.imul(hash, 1));
};
