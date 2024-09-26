export type Color = "backlog-blue" | "goal-green" | "poker-purple" | "online-orange" | "planning-pink" | "value-violet" | "yielding-yellow";

export const COLOR_ORDER: Color[] = ["planning-pink", "backlog-blue", "poker-purple", "value-violet", "goal-green", "yielding-yellow", "online-orange"];

export const getColorIndex = (color: Color) => COLOR_ORDER.indexOf(color);
export const getColorForIndex = (index: number, offset = 0) => COLOR_ORDER[(index + offset + COLOR_ORDER.length) % COLOR_ORDER.length];

export const getColorClassName = (color: Color | undefined) => `accent-color__${color ?? COLOR_ORDER[0]}`;

export function formatColorName(input: string): string {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const getRandomColor = () => getColorForIndex(Math.floor(Math.random() * COLOR_ORDER.length));

// assuming the array is like a rainbow spectrum
export const getNextColor = (color: Color) => getColorForIndex(getColorIndex(color), 1);
export const getPreviousColor = (color: Color) => getColorForIndex(getColorIndex(color), -1);
