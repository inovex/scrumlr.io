import {addProtocol, isImageUrl} from "utils/images";

describe("Images", () => {
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
    const notURL = "scrumlrIs.Awesome";
    const urlWithImageExtension = "https://www.example.com/image.jpg";

    it("should return true if the url ends with an image extension", async () => {
      isImageUrl(urlWithImageExtension).then((isImage) => {
        expect(isImage).toBe(true);
      });
    });

    it("should return false it the string is not a URL", async () => {
      isImageUrl(notURL).then((isImage) => {
        expect(isImage).toBe(false);
      });
    });
  });
});
