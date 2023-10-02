import {useState, useEffect} from "react";

export const useBooleanArrayWithTimeout = (length: number, timeoutDuration: number): [boolean[], (index: number, value: boolean) => void] => {
  const initialArray = Array.from({length}, () => true);
  const [booleanArray, setBooleanArray] = useState(initialArray);

  const setBooleanAtIndex = (index: number, value: boolean) => {
    setBooleanArray((prevArray) => {
      const newArray = [...prevArray];
      newArray[index] = value;
      return newArray;
    });
  };

  useEffect(() => {
    const timeoutIds = booleanArray.map((value, index) => {
      if (!value) {
        return setTimeout(() => {
          setBooleanAtIndex(index, true);
        }, timeoutDuration);
      }
      return null;
    });

    return () => {
      timeoutIds.forEach((timeoutId) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
    };
  }, [booleanArray, timeoutDuration]);

  return [booleanArray, setBooleanAtIndex];
};
