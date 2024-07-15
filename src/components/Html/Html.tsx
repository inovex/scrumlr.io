import {FC, useEffect, useState} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";
import {AutoTheme} from "types/view";

type HelmetProps = React.ComponentProps<typeof Helmet>;
const HelmetWorkaround: FC<HelmetProps> = ({...rest}) => <Helmet {...rest} />;

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  let title = useAppSelector((state) => state.board.data?.name);
  const theme = useAppSelector((state) => state.view.theme);

  if (title) title = `scrumlr.io - ${title}`;

  const getInitialAutoTheme = (): AutoTheme => {
    if (theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return theme;
  };

  const [autoTheme, setAutoTheme] = useState<AutoTheme>(getInitialAutoTheme());
  document.documentElement.setAttribute("theme", autoTheme.toString()); // initial update

  // when the systems color scheme changes and the theme is set to auto, set the current theme to the system setting.
  useEffect(() => {
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      const colorSchemePreference: AutoTheme = e.matches ? "dark" : "light";

      if (theme === "auto") {
        setAutoTheme(colorSchemePreference);
      } else {
        setAutoTheme(theme);
      }

      document.documentElement.setAttribute("theme", autoTheme.toString());
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleColorSchemeChange);

    return () => {
      // cleanup
      mediaQuery.removeEventListener("change", handleColorSchemeChange);
    };
  }, [autoTheme, theme]);

  return <HelmetWorkaround title={title} htmlAttributes={{lang, theme: autoTheme.toString()}} />;
};
