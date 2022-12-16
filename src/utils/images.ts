export const isImageUrl = async (url: string): Promise<boolean> => {
  console.log("isImageUrl", url);
  // Regular expression to match image file extensions
  const imageExtensionRegex = /\.(jpeg|jpg|gif|png)$/;
  if (imageExtensionRegex.test(url)) return true;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("Content-Type");
    return contentType !== null && contentType.startsWith("image/");
  } catch (error) {
    return false;
  }
};
