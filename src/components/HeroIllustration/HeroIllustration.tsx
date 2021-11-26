import FirstPanel from "assets/hero/1.svg";
import {FC} from "react";
import classNames from "classnames";
import "./HeroIllustration.scss";

export interface HeroIllustrationProps {
  className?: string;
}

export var HeroIllustration: FC<HeroIllustrationProps> = function ({className}) {
  return (
    <aside className={classNames("hero-illustration", className)} aria-hidden>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
      <div className="hero-illustration__tile">
        <img src={FirstPanel} className="hero-illustration__tile-image" />
      </div>
    </aside>
  );
};
