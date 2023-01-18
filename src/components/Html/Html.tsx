import {FC, useEffect, useState} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? (!window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  useEffect(() => {
    if (theme === "auto") {
      const autoTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
      setTheme(autoTheme);
    }
  }, [theme]);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    const colorScheme = e.matches ? "dark" : "light";

    if (!localStorage.getItem("theme") || localStorage.getItem("theme") === "auto") {
      setTheme(colorScheme);
      document.documentElement.setAttribute("theme", colorScheme);
    }
  });

  type HelmetProps = React.ComponentProps<typeof Helmet>;
  const HelmetWorkaround: FC<HelmetProps> = ({...rest}) => <Helmet {...rest} />;

  return <HelmetWorkaround htmlAttributes={{lang, theme}} />;
};
