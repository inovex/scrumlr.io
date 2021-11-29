import "./ValidationError.scss";
import {FC} from "react";

export var ValidationError: FC = function ({children}) {
  return (
    <span role="alert" className="validation-error">
      {children}
    </span>
  );
};
