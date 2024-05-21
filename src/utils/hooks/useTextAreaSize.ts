import React, {useEffect} from "react";

// Updates the height of a <textarea> when the value changes.
const useAutosizeTextArea = (textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>, value: string) => {
  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      const element = textAreaRef.current;
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      element.style.height = "0px";
      const {scrollHeight} = element;

      // We then set the height directly, outside the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      element.style.height = `${scrollHeight  }px`;
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
