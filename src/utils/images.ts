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
  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
  if (!urlRegex.test(url)) {
    return false;
  }

  // check if the url ends with an image extension, if so return true
  const imageExtensionRegex = /\.(jpeg|jpg|gif|png|apng|svg|bmp|bmp ico|png ico|ico|webp)$/;
  if (imageExtensionRegex.test(url)) {
    // pre-fetch image for faster load times once note is added
    fetch(addProtocol(url));
    return true;
  }

  // check if the url returns an image content type, if so return true
  try {
    const response = await fetch(addProtocol(url));
    const contentType = response.headers.get("Content-Type");
    return contentType !== null && contentType.startsWith("image/");
  } catch (error) {
    return false;
  }
};
