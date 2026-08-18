import {useEffect, useState} from "react";

// this hook delays the loading indicator (or in fact any boolean state) by a specified amount of time to prevent render flickering when the state changes quickly
export const useDelayedLoading = (isLoading: boolean, delay = 200) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading, delay]);

  return showLoading;
};
