import {useState, useEffect, useCallback} from "react";
import {Theme, AutoTheme} from "types/view";

/* this hook sets the current theme as a global attribute and returns it for further use.
 * if the theme is set to "auto", the system preference will be used. */
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
      } else {
        setAutoTheme(theme);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleColorSchemeChange);

    return () => {
      // cleanup
      mediaQuery.removeEventListener("change", handleColorSchemeChange);
    };
  }, [getInitialAutoTheme, theme]);

  // set the theme as an attribute, which can then be used inside stylesheets, e.g. [theme="dark"] {...}
  useEffect(() => {
    document.documentElement.setAttribute("theme", autoTheme.toString());
  }, [autoTheme]);

  return autoTheme;
};
