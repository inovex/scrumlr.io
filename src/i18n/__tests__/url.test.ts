import {Mock} from "vitest";
import {getI18n} from "react-i18next";
import {withLanguageQuery} from "utils/url";
import {withCurrentLanguageQuery} from "../url";
import {LANGUAGE_QUERY_PARAM} from "constants/i18n";

vi.mock("react-i18next", () => ({
  getI18n: vi.fn(),
}));

vi.mock("utils/url", () => ({
  withLanguageQuery: vi.fn(),
}));

describe("withCurrentLanguageQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (withLanguageQuery as Mock).mockImplementation((href: string, language: string) => `${href}?${LANGUAGE_QUERY_PARAM}=${language}`);
  });

  it("uses resolvedLanguage when available", () => {
    (getI18n as Mock).mockReturnValue({resolvedLanguage: "fr", language: "de"});

    const result = withCurrentLanguageQuery("/boards");

    expect(withLanguageQuery).toHaveBeenCalledWith("/boards", "fr");
    expect(result).toBe(`/boards?${LANGUAGE_QUERY_PARAM}=fr`);
  });

  it("falls back to language when resolvedLanguage is missing", () => {
    (getI18n as Mock).mockReturnValue({resolvedLanguage: undefined, language: "de"});

    const result = withCurrentLanguageQuery("/boards");

    expect(withLanguageQuery).toHaveBeenCalledWith("/boards", "de");
    expect(result).toBe(`/boards?${LANGUAGE_QUERY_PARAM}=de`);
  });

  it("falls back to en when neither resolvedLanguage nor language is available", () => {
    (getI18n as Mock).mockReturnValue({resolvedLanguage: undefined, language: undefined});

    const result = withCurrentLanguageQuery("/boards");

    expect(withLanguageQuery).toHaveBeenCalledWith("/boards", "en");
    expect(result).toBe(`/boards?${LANGUAGE_QUERY_PARAM}=en`);
  });
});
