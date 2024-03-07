import {FC, PropsWithChildren} from "react";
import "./Background.scss";

export const Background: FC<PropsWithChildren> = ({children}) => <div className="scrumlr-background">{children}</div>;
