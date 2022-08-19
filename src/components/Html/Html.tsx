import {FC, useState} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? (!window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    const colorScheme = e.matches ? "dark" : "light";

    if (!localStorage.getItem("theme") || localStorage.getItem("theme") === "auto") {
      setTheme(colorScheme);
      document.documentElement.setAttribute("theme", colorScheme);
    }
  });

  return <Helmet htmlAttributes={{lang, theme}} />;
};
