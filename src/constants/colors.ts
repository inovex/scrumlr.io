export type Color = "backlog-blue" | "goal-green" | "poker-purple" | "online-orange" | "planning-pink" | "value-violet" | "yielding-yellow";

const COLOR_ORDER: Color[] = ["backlog-blue", "value-violet", "planning-pink", "yielding-yellow", "goal-green", "poker-purple", "online-orange"];
export const getColorForIndex = (index: number) => COLOR_ORDER[index % COLOR_ORDER.length];

export const getColorClassName = (color: Color | undefined) => `accent-color__${color ?? COLOR_ORDER[0]}`;
