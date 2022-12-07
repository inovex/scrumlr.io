import {FC, useEffect} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";
import {useDispatch} from "react-redux";
import {Actions} from "../../store/action";

export const Html: FC = () => {
  const {lang, theme} = useAppSelector((state) => ({lang: state.view.language, theme: state.view.theme}));
  const dispatch = useDispatch();

  useEffect(() => {
    // initialize theme
    const userTheme = localStorage.getItem("theme");
    if (!userTheme || userTheme === "auto" || (userTheme !== "light" && userTheme !== "dark")) {
      if (!window.matchMedia) {
        // use dark theme as default, if media query is not available
        dispatch(Actions.setTheme("dark"));
      } else {
        // check OS configuration of theming and set it as the default state
        dispatch(Actions.setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
      }
    } else {
      // use user configuration of theming, if available
      dispatch(Actions.setTheme(userTheme));
    }

    // add listener for theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme") || localStorage.getItem("theme") === "auto") {
        const colorScheme = e.matches ? "dark" : "light";
        dispatch(Actions.setTheme(colorScheme));
      }
    });
  }, []);

  return <Helmet htmlAttributes={{lang, theme}} />;
};
