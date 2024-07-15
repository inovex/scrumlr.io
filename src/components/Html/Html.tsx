import React, {FC, useEffect} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";
import {useAutoTheme} from "../../utils/hooks/useAutoTheme";

type HelmetProps = React.ComponentProps<typeof Helmet>;
const HelmetWorkaround: FC<HelmetProps> = ({...rest}) => <Helmet {...rest} />;

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  let title = useAppSelector((state) => state.board.data?.name);
  if (title) title = `scrumlr.io - ${title}`;

  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);

  // set the theme as an attribute, which can then be used inside stylesheets, e.g. [theme="dark"] {...}
  useEffect(() => {
    document.documentElement.setAttribute("theme", autoTheme.toString());
  }, [autoTheme]);

  return <HelmetWorkaround title={title} htmlAttributes={{lang, theme: autoTheme.toString()}} />;
};
