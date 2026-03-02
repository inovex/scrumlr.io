import {normalizeRedirectPathname} from "../redirect";

describe("normalizeRedirectPathname", () => {
  it("returns the input unchanged when it does not contain '/settings'", () => {
    expect(normalizeRedirectPathname("/boards")).toBe("/boards");
    expect(normalizeRedirectPathname("/board/123")).toBe("/board/123");
    expect(normalizeRedirectPathname("/")).toBe("/");
    expect(normalizeRedirectPathname("")).toBe("");
  });

  it("trims '/settings' when it is the last segment", () => {
    expect(normalizeRedirectPathname("/boards/templates/settings")).toBe("/boards/templates");
    expect(normalizeRedirectPathname("/board/123/settings")).toBe("/board/123");
  });

  it("trims '/settings/*' when settings has nested routes", () => {
    expect(normalizeRedirectPathname("/boards/templates/settings/profile")).toBe("/boards/templates");
    expect(normalizeRedirectPathname("/board/123/settings/appearance")).toBe("/board/123");
  });

  it("returns '/' when the pathname starts with '/settings' (trim result would be empty)", () => {
    expect(normalizeRedirectPathname("/settings")).toBe("/");
    expect(normalizeRedirectPathname("/settings/profile")).toBe("/");
  });

  it("trims at the first occurrence of '/settings' if it appears multiple times", () => {
    expect(normalizeRedirectPathname("/a/settings/b/settings/c")).toBe("/a");
  });

  it("does not trim when 'settings' appears without the '/settings' segment prefix", () => {
    expect(normalizeRedirectPathname("/boardsettings")).toBe("/boardsettings");
    expect(normalizeRedirectPathname("/foo/mysettings/bar")).toBe("/foo/mysettings/bar");
  });

  it("documents current behavior: it also trims when '/settings' is a prefix of a longer segment", () => {
    // With the current implementation (indexOf("/settings")), this *will* trim.
    // If you later want segment-only matching, this test should be changed accordingly.
    expect(normalizeRedirectPathname("/foo/settingsness/bar")).toBe("/foo");
  });

  it("keeps trailing slash behavior consistent with simple substring trimming", () => {
    expect(normalizeRedirectPathname("/board/123/settings/")).toBe("/board/123");
    expect(normalizeRedirectPathname("/board/123/settings///extra")).toBe("/board/123");
  });
});
