import {isValidWebUrl, normalizeAndParseUrl} from "utils/url";

// checks if the given url starts with http(s)://, if not adds https:// to the beginning
export const addProtocol = (url: string): string => {
  if (!/^http(s)?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

// handles domain syntax validation + image checks
export const isImageUrl = async (url: string, signal: AbortSignal): Promise<boolean> => {
  // 1. fail early if the raw input doesn't resemble a domain structure
  const parsedUrl = normalizeAndParseUrl(url);

  if (!parsedUrl) {
    return false;
  }

  if (!isValidWebUrl(parsedUrl)) {
    return false;
  }

  // 2. image extension check
  const imageExtensionRegex = /\.(jpeg|jpg|gif|png|apng|svg|bmp|ico|webp)$/i;
  if (imageExtensionRegex.test(parsedUrl.pathname)) {
    return true;
  }

  // 3. fallback: check header mime type for dynamic image URLs without extensions
  try {
    const response = await fetch(parsedUrl.href, {
      method: "HEAD",
      signal,
    });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("Content-Type");
    return contentType?.toLowerCase().startsWith("image/") ?? false;
  } catch {
    return false;
  }
};
