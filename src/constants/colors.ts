export type Color = 'blue' | 'purple' | 'violet' | 'pink';

export const getColorClassName = (color: Color) => `accent-color__${color}`;