import {useState, useCallback} from "react";

/**
 * this hook takes a passive value as initial value and an active value.
 * after calling the returned function `resetValue`, the value is set to active.
 * after a timeout of length `delay`, the value is then reset to passive.
 * @param {T} passiveValue the initial and default value
 * @param {T} activeValue the active value after calling resetValue
 * @param {number} delay the delay after which the value is reset to passiveValue (in milliseconds)
 * @returns {[T, () => void]} array containing the current value and a function to briefly set to active value
 */
export const useDelayedReset = <T>(passiveValue: T, activeValue: T, delay: number): [value: T, resetValue: () => void] => {
  const [value, setValue] = useState<T>(passiveValue);

  const resetValue = useCallback(() => {
    setValue(activeValue);
    setTimeout(() => {
      setValue(passiveValue);
    }, delay);
  }, [passiveValue, activeValue, delay]);

  return [value, resetValue];
};
