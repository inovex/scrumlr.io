import {FunctionComponent, useEffect, useState} from "react";

interface IconProps {
  name: "ic_focus" | "ic_check" | "ic_raisehand" | "ic_settings" | "ic_timer" | "ic_vote";
  [key: string]: any;
}
export const Icon: FunctionComponent<IconProps> = ({name, ...others}) => {
  const [path, setPath] = useState(undefined);

  useEffect(() => {
    (async () => {
      const {default: _path} = await import(`assets/icons/dark/${name}.svg`);
      setPath(_path);
    })();
  }, [name]);

  return <>{path && <img src={path} {...others} />}</>;
};
