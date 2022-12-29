import "./ValidationError.scss";
import {FC, PropsWithChildren} from "react";

export const ValidationError: FC<PropsWithChildren> = ({children}) => (
  <span role="alert" className="validation-error">
    {children}
  </span>
);
