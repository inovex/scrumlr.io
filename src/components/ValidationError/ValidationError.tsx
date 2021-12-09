import "./ValidationError.scss";
import {FC} from "react";

export const ValidationError: FC = ({children}) => (
  <span role="alert" className="validation-error">
    {children}
  </span>
);
