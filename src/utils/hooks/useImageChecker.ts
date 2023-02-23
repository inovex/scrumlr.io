import {useState, useEffect} from "react";
import {isImageUrl} from "utils/images";

// custom hook to check if a given string is a valid image url
export const useImageChecker = (text: string) => {
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const checkImageUrl = async () => {
      const url = text;
      setIsImage(await isImageUrl(url));
    };

    checkImageUrl();
  }, [text]);

  return isImage;
};
