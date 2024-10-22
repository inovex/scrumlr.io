import {Outlet} from "react-router-dom";
import classNames from "classnames";
import StanDark from "../../../assets/stan/Stan_OK_Dark.svg";
import StanLight from "../../../assets/stan/Stan_OK_Light.svg";

export const Sessions = () => (
  <>
    <Outlet /> {/* settings */}
    <div>
      <div className="templates__stan-container">
        <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan just hanging there with a coffee" />
        <img className={classNames("templates__stan", "templates__stan--light")} src={StanLight} alt="Stan just hanging there with a coffee" />
      </div>
    </div>
  </>
);
