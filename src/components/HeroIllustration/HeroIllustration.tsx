import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {FC} from "react";
import classNames from "classnames";
import "./HeroIllustration.scss";

export interface HeroIllustrationProps {
  className?: string;
}

export var HeroIllustration: FC<HeroIllustrationProps> = function({className}) {
  return <aside className={classNames("hero-illustration", className)} aria-hidden>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <German className="hero-illustration__tile-image" />
    </div>
    <div className="hero-illustration__tile">
      <English className="hero-illustration__tile-image" />
    </div>
  </aside>
}
