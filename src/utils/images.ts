// checks if the given url starts with http(s)://, if not adds https:// to the beginning
export const addProtocol = (url: string): string => {
  if (!/^http(s)?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

// takes a string and returns true if it is a valid image url
export const isImageUrl = async (url: string): Promise<boolean> => {
  // check if given text could be a url, if not return false
  const normalizedUrl = addProtocol(url.trim());

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return false;
  }

  // Only allow web URLs
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }

  const imageExtensionRegex = /\.(jpeg|jpg|gif|png|apng|svg|bmp|ico|webp)$/i;
  if (imageExtensionRegex.test(parsedUrl.pathname)) {
    void fetch(parsedUrl.href);
    return true;
  }

  // check if the url returns an image content type, if so return true
  try {
    const response = await fetch(parsedUrl.href);
    const contentType = response.headers.get("Content-Type");
    return contentType?.startsWith("image/") ?? false;
  } catch {
    return false;
  }
};
