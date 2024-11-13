import {ADJECTIVES, ANIMAL_NAMES, MYTHICAL_CREATURES} from "../constants/nameList";

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

export const getRandomName = () => {
  let randomCreature;
  let randomAdjective;

  const oneOrZero = Math.random() > 0.5 ? 1 : 0;
  if (oneOrZero === 1) {
    const keys = Object.keys(ANIMAL_NAMES);
    const randomKey = keys[Math.floor(keys.length * Math.random())];
    randomCreature = ANIMAL_NAMES[randomKey][Math.floor(ANIMAL_NAMES[randomKey].length * Math.random())];
    randomAdjective = ADJECTIVES[randomKey][Math.floor(ADJECTIVES[randomKey].length * Math.random())];
  } else {
    const keys = Object.keys(MYTHICAL_CREATURES);
    const randomKey = keys[Math.floor(keys.length * Math.random())];
    randomCreature = MYTHICAL_CREATURES[randomKey][Math.floor(MYTHICAL_CREATURES[randomKey].length * Math.random())];
    randomAdjective = ADJECTIVES[randomKey][Math.floor(ADJECTIVES[randomKey].length * Math.random())];
  }

  return `${randomAdjective} ${randomCreature}`;
};

function hashString(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33 + str.charCodeAt(i)) % 2 ** 32;
  }
  return hash;
}

function seededRandom(seed: string) {
  let value = hashString(seed);
  return () => {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    value = (a * value + c) % m;
    return value / m;
  };
}

export const getRandomNameWithSeed = (seed: string) => {
  const rng = seededRandom(seed);

  let randomCreature;
  let randomAdjective;

  const oneOrZero = rng() > 0.5 ? 1 : 0;
  if (oneOrZero === 1) {
    const keys = Object.keys(ANIMAL_NAMES);
    const randomKey = keys[Math.floor(keys.length * rng())];
    randomCreature = ANIMAL_NAMES[randomKey][Math.floor(ANIMAL_NAMES[randomKey].length * rng())];
    randomAdjective = ADJECTIVES[randomKey][Math.floor(ADJECTIVES[randomKey].length * rng())];
  } else {
    const keys = Object.keys(MYTHICAL_CREATURES);
    const randomKey = keys[Math.floor(keys.length * rng())];
    randomCreature = MYTHICAL_CREATURES[randomKey][Math.floor(MYTHICAL_CREATURES[randomKey].length * rng())];
    randomAdjective = ADJECTIVES[randomKey][Math.floor(ADJECTIVES[randomKey].length * rng())];
  }

  return `${randomAdjective} ${randomCreature}`;
};
