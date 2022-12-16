export const isImageUrl = async (url: string): Promise<boolean> => {
  const imageExtensionRegex = /\.(jpeg|jpg|gif|png|apng|svg|bmp|bmp ico|png ico|ico|webp)$/;
  if (imageExtensionRegex.test(url)) return true;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("Content-Type");
    return contentType !== null && contentType.startsWith("image/");
  } catch (error) {
    return false;
  }
};
