// checks if the given url starts with http(s)://, if not adds https:// to the beginning
export const addProtocol = (url: string): string => {
  if (!/^http(s)?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export const normalizeAndParseUrl = (input: string): URL | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
};

// for example, "a" get converted to https://a which is technically a valid Url but realistically not a valid web url
// which is why we do some custom checking to minimize false positives and therefore fetches
export const isValidWebUrl = (url: URL): boolean => {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  const hostname = url.hostname;

  // require at least one dot for domain.tld (or localhost/IP)
  const isLocalhostOrIp = hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const hasValidTld = hostname.includes(".") && !hostname.startsWith(".") && !hostname.endsWith(".");

  return isLocalhostOrIp || hasValidTld;
};

// handles domain syntax validation + image checks
export const isImageUrl = async (url: string, signal: AbortSignal): Promise<boolean> => {
  // 1. fail early if the raw input doesn't resemble a domain structure
  const parsedUrl = normalizeAndParseUrl(url);
  if (!parsedUrl) return false;
  if (!isValidWebUrl(parsedUrl)) {
    return false;
  }

  // 2. image extension check
  const imageExtensionRegex = /\.(jpeg|jpg|gif|png|apng|svg|bmp|ico|webp)$/i;
  if (imageExtensionRegex.test(parsedUrl.pathname)) {
    return true;
  }

  // 3. Fallback HEAD request for dynamic image URLs without extensions
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
