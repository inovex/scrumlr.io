import {Timer} from "components/Timer";
import ReactDOM from "react-dom";
import "./Infobar.scss";

type InfobarProps = {
  endTime?: Date;
};

export const Infobar = (props: InfobarProps) => ReactDOM.createPortal(
    <aside className="infobar">
      {props.endTime && <Timer endTime={props.endTime} />}
      {props.endTime && <Timer endTime={props.endTime} />}
    </aside>,
    document.getElementById("root")!
  );
