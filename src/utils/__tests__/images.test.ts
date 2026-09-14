import {addProtocol, isImageUrl} from "utils/images";

describe("Images", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("addProtocol", () => {
    const urlWithoutProtocol = "www.example.com";
    const urlWithProtocol = "https://www.example.com";

    it("should add https:// to the beginning of the url if it doesn't have a protocol", () => {
      const returnedUrl = addProtocol(urlWithoutProtocol);
      expect(returnedUrl).toBe(urlWithProtocol);
    });

    it("should not add https:// to the beginning of the url if it already has a protocol", () => {
      const returnedUrl = addProtocol(urlWithProtocol);
      expect(returnedUrl).toBe(urlWithProtocol);
    });
  });

  describe("isImageUrl", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    describe("Extension Fast-Path (No Fetch)", () => {
      it("should return true for URLs with image extensions without calling fetch", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        const url = "https://http.cat/images/200.jpg";

        const isImage = await isImageUrl(url, new AbortSignal());

        expect(isImage).toBe(true);
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it("should handle capital extensions and query parameters", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        const url = "example.com/photo.PNG?v=123";

        const isImage = await isImageUrl(url, new AbortSignal());

        expect(isImage).toBe(true);
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });

    describe("Invalid URLs & Malformed Input", () => {
      it("should return false for invalid or malformed strings without calling fetch", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        const invalidStrings = ["", "   ", "not-a-url", "a", "https://"];

        for (const str of invalidStrings) {
          const isImage = await isImageUrl(str, new AbortSignal());
          expect(isImage).toBe(false);
        }

        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });

    describe("Extensionless URLs (HEAD Request Fallback)", () => {
      it("should return true when a HEAD request yields an image Content-Type", async () => {
        const url = "https://avatars.githubusercontent.com/u/9919";
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
          new Response(null, {
            status: 200,
            headers: {"Content-Type": "image/png"},
          })
        );

        const isImage = await isImageUrl(url, new AbortSignal());

        expect(fetchSpy).toHaveBeenCalledWith(url, expect.objectContaining({method: "HEAD"}));
        expect(isImage).toBe(true);
      });

      it("should return false when HEAD request returns a non-image Content-Type", async () => {
        const url = "https://example.com/document";
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
          new Response(null, {
            status: 200,
            headers: {"Content-Type": "text/html"},
          })
        );

        const isImage = await isImageUrl(url, new AbortSignal());

        expect(isImage).toBe(false);
      });

      it("should return false when HEAD request fails with a non-200 status code", async () => {
        const url = "https://example.com/missing-image";
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 404}));

        const isImage = await isImageUrl(url, new AbortSignal());

        expect(isImage).toBe(false);
      });

      it("should return false when fetch throws a network error or is aborted", async () => {
        const url = "https://example.com/error";
        const controller = new AbortController();

        vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("The operation was aborted", "AbortError"));

        controller.abort();
        const isImage = await isImageUrl(url, controller.signal);

        expect(isImage).toBe(false);
      });
    });
  });
});
