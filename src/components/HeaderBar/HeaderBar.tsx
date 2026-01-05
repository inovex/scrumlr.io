import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ScrumlrLogo} from "components/ScrumlrLogo/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import "./HeaderBar.scss";

type HeaderBarProps = {
  renderTitle: () => string;
  locationPrefix?: string;
};

export const HeaderBar = (props: HeaderBarProps) => {
  const {t} = useTranslation();

  return (
    <div className="headerBar">
      <div className="headerBar__top-row">
        {/* logo - - - profile */}
        <div className="headerBar__scrumlr-logo-container">
          {/* this still needs fixing bc that uses other styles */}
          <a className="new-board__scrumlr-logo-href" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="new-board__scrumlr-logo" />
          </a>
        </div>

        {/* - - title - - */}
        <div className="headerBar__title">{props.renderTitle()}</div>

        <UserPill className="headerBar__user-pill" locationPrefix={props.locationPrefix} />
      </div>
    </div>
  );
};
