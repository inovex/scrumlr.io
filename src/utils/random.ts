const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateRandomString = (length = 8) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
};

/**
 * returns a random whole number in the given range
 * @param min lower bound
 * @param max upper bound
 */
export const getRandomNumberInRange = (min: number, max: number): number => {
  const range = max - min + 1;
  return Math.floor(Math.random() * range) + min;
};
