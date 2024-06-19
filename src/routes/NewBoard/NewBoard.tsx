import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {Switch, SwitchDirection} from "components/Switch/Switch";
import "./NewBoard.scss";

type BoardView = "templates" | "sessions";

export const NewBoard = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [_, setBoardView] = useState<BoardView>("templates");

  const getCurrentLocation = (): BoardView => (location.pathname.endsWith("/templates") ? "templates" : "sessions");

  // init switch is separated from boardView state because this function is called before the state is updated,
  // so it can't be used as the input prop but has to be called independently
  const initSwitch = (): SwitchDirection => (getCurrentLocation() === "templates" ? "left" : "right");

  useEffect(() => {
    const currentLocation = getCurrentLocation();
    setBoardView(currentLocation);
  }, [location]);

  const switchView = (location: string) => {
    navigate(location);
  };
  return (
    <div className="new-board">
      <header className="new-board__header">
        {/* logo - - - profile */}
        <div className="new-board__header-grid">
          <div>
            <a className="new-board__logo-wrapper" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
              <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
            </a>
          </div>
          <UserPill className="new-board__user-pill" />

          {/* - - title - - */}
          <div className="new-board__title">Choose a template</div>
        </div>

        {/* switch - - - search */}
        <div className="new-board__header-bottom">
          <label className="switch">
            <Switch
              initialize={initSwitch}
              leftText="Templates"
              onLeftSwitch={() => switchView("templates")}
              rightText="Saved Sessions"
              onRightSwitch={() => switchView("sessions")}
            />
            <span className="slider round" />
          </label>

          <label className="search">
            <input type="text" />
          </label>
        </div>
      </header>
      {/* <Outlet /> */}
    </div>
  );
};
