import {useState, useEffect} from "react";

/**
 * this hook keeps track of an array of type T.
 * if any value equals the active value, it is set back to the passive value after the given timeout.
 * the timeouts are separate for each index value!
 * @param length total number of elements in the array
 * @param activeValue value which activates the timeout for an index
 * @param passiveValue value which the index is reset to after the timeout
 * @param timeoutDuration value of timeout in milliseconds
 * @returns an array containing array with value, setterFunction to set a value at given index
 */
export const useDebounceArray = <T>(length: number, activeValue: T, passiveValue: T, timeoutDuration: number): [T[], (index: number, value: T) => void] => {
  const initialArray = Array.from({length}, () => activeValue);
  const [valueArray, setValueArray] = useState(initialArray);

  const setValueAtIndex = (index: number, value: T) => {
    setValueArray((prevArray) => {
      const newArray = [...prevArray];
      newArray[index] = value;
      return newArray;
    });
  };

  useEffect(() => {
    const timeoutIds = valueArray.map((value, index) => {
      if (value === activeValue) {
        return setTimeout(() => {
          setValueAtIndex(index, passiveValue);
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
  });

  return [valueArray, setValueAtIndex];
};
