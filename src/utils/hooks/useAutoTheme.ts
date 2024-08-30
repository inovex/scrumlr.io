import {useState, useEffect, useCallback} from "react";
import {Theme, AutoTheme} from "store/features/view/view";

/** this hook return the theme that should be used, regarding the current system preferences. */
export const useAutoTheme = (theme: Theme): AutoTheme => {
  const getInitialAutoTheme = useCallback((): AutoTheme => {
    if (theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  const [autoTheme, setAutoTheme] = useState<AutoTheme>(getInitialAutoTheme());

  // update the theme. if it's set to auto, use the system preference, otherwise use the value.
  useEffect(() => {
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      const colorSchemePreference: AutoTheme = e.matches ? "dark" : "light";

      if (theme === "auto") {
        setAutoTheme(colorSchemePreference);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleColorSchemeChange);

    // update the theme based on the initial value and theme changes
    setAutoTheme(getInitialAutoTheme());

    return () => {
      // cleanup
      mediaQuery.removeEventListener("change", handleColorSchemeChange);
    };
  }, [getInitialAutoTheme, theme]);

  return autoTheme;
};
