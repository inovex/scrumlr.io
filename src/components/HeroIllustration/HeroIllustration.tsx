import Panel01 from "assets/hero/scrumlr-lp-01.svg";
import Panel02 from "assets/hero/scrumlr-lp-02.svg";
import Panel03 from "assets/hero/scrumlr-lp-03.svg";
import Panel04 from "assets/hero/scrumlr-lp-04.svg";
import Panel05 from "assets/hero/scrumlr-lp-05.svg";
import Panel06 from "assets/hero/scrumlr-lp-06.svg";
import Panel07 from "assets/hero/scrumlr-lp-07.svg";
import Panel08 from "assets/hero/scrumlr-lp-08.svg";
import Panel09 from "assets/hero/scrumlr-lp-09.svg";
import Panel10 from "assets/hero/scrumlr-lp-10.svg";
import Panel11 from "assets/hero/scrumlr-lp-11.svg";
import Panel12 from "assets/hero/scrumlr-lp-12.svg";
import ActionbarUser from "assets/hero/scrumlr_actionbar_user.svg?url";
import ActionbarModerator from "assets/hero/scrumlr_actionbar_mod.svg?url";
import {FC} from "react";
import classNames from "classnames";
import "./HeroIllustration.scss";

export interface HeroIllustrationProps {
  className?: string;
}

/**
 * @deprecated to be removed with the landing page redesign
 */
export const HeroIllustration: FC<HeroIllustrationProps> = ({className}) => (
  <aside className={classNames("hero-illustration", className)} aria-hidden>
    <div className="hero-illustration__position-anchor">
      <div className="hero-illustration__grid">
        <img src={ActionbarUser} className="hero-illustration__actionbar-user" alt="" />
        <img src={ActionbarModerator} className="hero-illustration__actionbar-moderator" alt="" />

        <div className="hero-illustration__tile">
          <Panel01 />
        </div>
        <div className="hero-illustration__tile">
          <Panel02  />
        </div>
        <div className="hero-illustration__tile">
          <Panel03   />
        </div>
        <div className="hero-illustration__tile">
          <Panel04   />
        </div>
        <div className="hero-illustration__tile">
          <Panel05   />
        </div>
        <div className="hero-illustration__tile">
          <Panel06   />
        </div>
        <div className="hero-illustration__tile">
          <Panel07   />
        </div>
        <div className="hero-illustration__tile">
          <Panel08   />
        </div>
        <div className="hero-illustration__tile">
          <Panel09   />
        </div>
        <div className="hero-illustration__tile">
          <Panel10   />
        </div>
        <div className="hero-illustration__tile">
          <Panel11   />
        </div>
        <div className="hero-illustration__tile">
          <Panel12   />
        </div>
      </div>
    </div>
  </aside>
);
