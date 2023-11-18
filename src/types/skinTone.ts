// the [?] characters are the skin tone modifiers
export const skinTones = {
  default: "",
  light: "🏻",
  medium_light: "🏼",
  medium: "🏽",
  medium_dark: "🏾",
  dark: "🏿",
} as const;

export type SkinToneName = keyof typeof skinTones;
export type SkinToneComponent = (typeof skinTones)[SkinToneName];

export interface SkinTone {
  readonly name: SkinToneName;
  readonly component: SkinToneComponent;
}

export type SkinToneState = SkinTone;
