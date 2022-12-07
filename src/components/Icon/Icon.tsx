import {FunctionComponent, useEffect, useState} from "react";
import {useAppSelector} from "../../store";

export type IconType = "ic_focus" | "ic_check" | "ic_raisehand" | "ic_settings" | "ic_timer" | "ic_vote";

interface IconProps {
  name: IconType;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export const Icon: FunctionComponent<IconProps> = ({name, ...others}) => {
  const theme = useAppSelector((s) => s.view.theme);
  const [path, setPath] = useState(undefined);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const {default: _path} = await import(`assets/icons/${theme || "dark"}/${name}.svg`);
      setPath(_path);
    })();
  }, [name, theme]);

  if (path) {
    return <img src={path} alt={path} {...others} />;
  }
  return null;
};
