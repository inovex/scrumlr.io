import {MutableRefObject, useEffect} from "react";

// Updates the height of a <textarea> when the value changes.
const useAutosizeTextArea = (textAreaRef: MutableRefObject<HTMLTextAreaElement | null>, value: string) => {
  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      const element = textAreaRef.current;
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      element.style.height = "auto";
      const {scrollHeight} = element;
      element.style.height = `${scrollHeight + 2}px`;
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
