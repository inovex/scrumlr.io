import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {SearchBar} from "components/SearchBar/SearchBar";
import {Switch} from "components/Switch/Switch";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import classNames from "classnames";
import "./NewBoard.scss";

type BoardView = "templates" | "sessions";

export const NewBoard = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [boardView, setBoardView] = useState<BoardView>("templates");
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);

  const toggleMobileSearchBar = () => {
    setShowMobileSearchBar((open) => !open);
  };

  // navigate to view that is currently not visible
  const switchView = () => {
    if (boardView === "templates") {
      navigate("sessions");
    } else {
      navigate("templates");
    }
  };

  useEffect(() => {
    const currentLocation: BoardView = location.pathname.endsWith("/templates") ? "templates" : "sessions";
    setBoardView(currentLocation);
  }, [location]);

  return (
    <div className="new-board">
      <header className="new-board__header">
        {/* logo - - - profile */}
        <div>
          <a className="new-board__logo-wrapper" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="board-header__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
          </a>
        </div>
        <UserPill className="new-board__user-pill" locationPrefix={boardView} />

        {/* - - title - - */}
        <div className="new-board__title">{boardView === "templates" ? t("Templates.title") : t("Sessions.title")}</div>

        {/* switch - - - search */}
        <Switch
          className="new-board__switch"
          activeDirection={boardView === "templates" ? "left" : "right"}
          leftText={t("Templates.switchTitle")}
          rightText={t("Sessions.switchTitle")}
          toggle={switchView}
        />

        <SearchBar className="new-board__search-bar" />

        <button className="new-board__search-button" onClick={toggleMobileSearchBar}>
          <div className={classNames("new-board__search-button-icon-container", {"new-board__search-button-icon-container--active": showMobileSearchBar})}>
            <SearchIcon className="new-board__search-button-icon" aria-label="icon of magnifying glass" />
          </div>
        </button>
        {showMobileSearchBar && <SearchBar className="new-board__mobile-search-bar" closable onClose={toggleMobileSearchBar} />}
      </header>
      <main className="new-board__outlet">
        <Outlet />
      </main>
    </div>
  );
};
