import React, {FC} from "react";
import {Helmet} from "react-helmet";
import {useAppSelector} from "store";
import {useAutoTheme} from "../../utils/hooks/useAutoTheme";

type HelmetProps = React.ComponentProps<typeof Helmet>;
const HelmetWorkaround: FC<HelmetProps> = ({...rest}) => <Helmet {...rest} />;

export const Html: FC = () => {
  const lang = useAppSelector((state) => state.view.language);
  let title = useAppSelector((state) => state.board.data?.name);
  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);

  if (title) title = `scrumlr.io - ${title}`;

  return <HelmetWorkaround title={title} htmlAttributes={{lang, theme: autoTheme.toString()}} />;
};
