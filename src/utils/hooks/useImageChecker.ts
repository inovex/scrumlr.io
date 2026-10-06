import {useState, useEffect} from "react";
import {isImageUrl} from "utils/images";

const CHECK_DEBOUNCE_DELAY_MS = 300;

// custom hook to check if a given string is a valid image url
export const useImageChecker = (text: string) => {
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const result = await isImageUrl(text, controller.signal);

      if (!controller.signal.aborted) {
        setIsImage(result);
      }
    }, CHECK_DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort(); // cancel active fetches if text changes
    };
  }, [text]);

  return isImage;
};
