import {setQueryParam, withLanguageQuery} from "../url";
import {LANGUAGE_QUERY_PARAM} from "constants/i18n";

describe(`setQueryParam`, () => {
  it(`sets a generic query parameter on relative paths`, () => {
    expect(setQueryParam(`/boards`, `view`, `templates`)).toBe(`/boards?view=templates`);
    expect(setQueryParam(`/boards?foo=bar`, `view`, `sessions`)).toBe(`/boards?foo=bar&view=sessions`);
  });

  it(`replaces existing query parameters by key`, () => {
    expect(setQueryParam(`/boards?view=templates`, `view`, `sessions`)).toBe(`/boards?view=sessions`);
    expect(setQueryParam(`https://test.de/?view=templates`, `view`, `sessions`)).toBe(`https://test.de/?view=sessions`);
  });

  it(`preserves hash fragments`, () => {
    expect(setQueryParam(`/boards#details`, `view`, `templates`)).toBe(`/boards?view=templates#details`);
    expect(setQueryParam(`https://test.de/boards#details`, `view`, `templates`)).toBe(`https://test.de/boards?view=templates#details`);
  });
});

describe(`withLanguageQuery`, () => {
  it(`appends a language to a relative path`, () => {
    expect(withLanguageQuery(`/blubb`, `fr`)).toBe(`/blubb?${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`blubb`, `fr`)).toBe(`/blubb?${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`/`, `en`)).toBe(`/?${LANGUAGE_QUERY_PARAM}=en`);
    expect(withLanguageQuery(``, `en`)).toBe(`/?${LANGUAGE_QUERY_PARAM}=en`);
  });

  it(`appends a language to an absolute path`, () => {
    expect(withLanguageQuery(`https://test.de`, `fr`)).toBe(`https://test.de/?${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`https://test.de/`, `fr`)).toBe(`https://test.de/?${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`https://test.de/blubb`, `fr`)).toBe(`https://test.de/blubb?${LANGUAGE_QUERY_PARAM}=fr`);
  });
  it(`replaces a language`, () => {
    expect(withLanguageQuery(`https://test.de/?${LANGUAGE_QUERY_PARAM}=en`, `fr`)).toBe(`https://test.de/?${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`/blubb/?${LANGUAGE_QUERY_PARAM}=en`, `fr`)).toBe(`/blubb/?${LANGUAGE_QUERY_PARAM}=fr`);
  });

  it(`appends language query to existing query`, () => {
    expect(withLanguageQuery(`https://test.de/?blubb=bla`, `fr`)).toBe(`https://test.de/?blubb=bla&${LANGUAGE_QUERY_PARAM}=fr`);
    expect(withLanguageQuery(`/blubb/?blubb=bla`, `fr`)).toBe(`/blubb/?blubb=bla&${LANGUAGE_QUERY_PARAM}=fr`);
  });

  it(`appends language query and preserves hash fragments`, () => {
    expect(withLanguageQuery(`https://test.de/blubb#bla`, `fr`)).toBe(`https://test.de/blubb?${LANGUAGE_QUERY_PARAM}=fr#bla`);
    expect(withLanguageQuery(`/blubb/blubb#bla`, `fr`)).toBe(`/blubb/blubb?${LANGUAGE_QUERY_PARAM}=fr#bla`);
  });

  it(`appends language query and preserves hash fragments and existing queries`, () => {
    expect(withLanguageQuery(`https://test.de/?foo=bar#blubb`, `fr`)).toBe(`https://test.de/?foo=bar&${LANGUAGE_QUERY_PARAM}=fr#blubb`);
    expect(withLanguageQuery(`/blubb/?foo=bar#blubb`, `fr`)).toBe(`/blubb/?foo=bar&${LANGUAGE_QUERY_PARAM}=fr#blubb`);
  });
});
