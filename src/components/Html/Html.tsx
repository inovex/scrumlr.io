import {FC} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  const theme = localStorage.getItem("theme") ?? (!window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  return <Helmet htmlAttributes={{lang, theme}} />;
};
