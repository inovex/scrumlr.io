// checks if the given url starts with http(s)://, if not adds https:// to the beginning
export const addProtocol = (url: string): string => {
  if (!/^http(s)?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

// helper to verify string looks like a domain or IP before adding protocol
const isValidWebUrl = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // regex to require at least domain.tld or localhost/IP address
  // ensures single letters like "a" or incomplete words fail early
  // TODO: use established package for url checking instead of unmaintainable regex
  const domainPattern = /^(https?:\/\/)?(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/i;

  return domainPattern.test(trimmed);
};

// handles domain syntax validation + image checks
export const isImageUrl = async (url: string, signal: AbortSignal): Promise<boolean> => {
  // 1. fail early if the raw input doesn't resemble a domain structure
  if (!isValidWebUrl(url)) {
    return false;
  }

  const normalizedUrl = addProtocol(url.trim());

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
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
