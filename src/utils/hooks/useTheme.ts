import {useEffect, useState} from "react";

type Theme = "light" | "dark";
const getThemeAttribute = () => document.documentElement.getAttribute("theme") as Theme;

/** sometimes, the theme has to be known not only in the stylesheet, but in component itself.
 * this hook returns the current theme. */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getThemeAttribute());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Update the theme when the 'theme' attribute changes
      setTheme(getThemeAttribute());
    });

    // observe attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["theme"],
    });

    // clean up
    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
};
