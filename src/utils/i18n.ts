import {ParseKeys} from "i18next";

/** Every valid key in translation.json, e.g. "LoginBoard.title" */
export type TranslationKey = ParseKeys<"translation">;

/** Every valid key in templates.json, e.g. "template.lean_coffee.name" */
export type TemplatesKey = ParseKeys<"templates">;

/**
 * Use when a key is built while the app runs, so its value cannot be known at build time.
 * Does nothing at runtime, it only silences the type error. If the key turns out not to exist,
 * i18next renders the key itself, which is what these call sites already rely on.
 *
 * If a key IS known at build time, type it as TranslationKey instead so typos can get caught.
 */
export const dynamicTranslationKey = (key: string) => key as TranslationKey;

/** Same as {@link dynamicTranslationKey}, for the `templates` namespace. */
export const dynamicTemplatesKey = (key: string) => key as TemplatesKey;
