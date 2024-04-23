export type Color = "backlog-blue" | "grooming-green" | "goal-green" | "lean-lilac" | "online-orange" | "planning-pink" | "poker-purple" | "retro-red" | "warning-red";

const COLOR_ORDER: Color[] = ["backlog-blue", "lean-lilac", "planning-pink", "retro-red", "grooming-green", "poker-purple", "online-orange"];
export const getColorForIndex = (index: number) => COLOR_ORDER[index % COLOR_ORDER.length];

export const getColorClassName = (color: Color | undefined) => `accent-color__${color ?? COLOR_ORDER[0]}`;
