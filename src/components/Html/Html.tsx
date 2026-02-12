import {Helmet} from "react-helmet-async";
import {useAppSelector} from "store";
import {useAutoTheme} from "utils/hooks/useAutoTheme";

export const Html = () => {
  const lang = useAppSelector((state) => state.view.language);
  const title = useAppSelector((state) => state.board.data?.name);

  const displayTitle = title ? `scrumlr.io - ${title}` : "scrumlr.io";

  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <html lang={lang} data-theme={autoTheme.toString()} />
    </Helmet>
  );
};
