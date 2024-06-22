import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {SearchBar} from "components/SearchBar/SearchBar";
import {Switch} from "components/Switch/Switch";
import {ReactComponent as SearchLogo} from "assets/icons/search.svg";
import "./NewBoard.scss";

type BoardView = "templates" | "sessions";

export const NewBoard = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [boardView, setBoardView] = useState<BoardView>("templates");

  useEffect(() => {
    const currentLocation: BoardView = location.pathname.endsWith("/templates") ? "templates" : "sessions";
    setBoardView(currentLocation);
  }, [location]);

  const switchView = (route: string) => {
    navigate(route);
  };
  return (
    <div className="new-board">
      <div className="new-board__grid">
        {/* logo - - - profile */}
        <div>
          <a className="new-board__logo-wrapper" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
          </a>
        </div>
        <UserPill className="new-board__user-pill" />

        {/* - - title - - */}
        <div className="new-board__title">{boardView === "templates" ? t("Templates.title") : t("Sessions.title")}</div>

        {/* switch - - - search */}
        <Switch
          className="new-board__switch"
          activeDirection={boardView === "templates" ? "left" : "right"}
          leftText={t("Templates.switchTitle")}
          onLeftSwitch={() => switchView("templates")}
          rightText={t("Sessions.switchTitle")}
          onRightSwitch={() => switchView("sessions")}
        />

        <SearchBar className="new-board__search-bar" />

        <button className="new-board__search-button">
          <div className="new-board__search-button-logo-container">
            <SearchLogo className="new-board__search-button-logo" aria-label="logo of magnifying glass" />
          </div>
        </button>
        <SearchBar className="new-board__mobile-search-bar" />

        <main className="new-board__outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
