import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {SearchBar} from "components/SearchBar/SearchBar";
import {Switch} from "components/Switch/Switch";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import classNames from "classnames";
import "./Boards.scss";

type BoardView = "templates" | "sessions";

export const Boards = () => {
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
    <div className="boards">
      <div className="boards__grid">
        {/* logo - - - profile */}
        <div className="boards__scrumlr-logo-container">
          <a className="new-board__scrumlr-logo-href" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="new-board__scrumlr-logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
          </a>
        </div>
        <UserPill className="boards__user-pill" locationPrefix={boardView} />

        {/* - - title - - */}
        <div className="boards__title">{boardView === "templates" ? t("Templates.title") : t("Sessions.title")}</div>

        {/* switch - - - search */}
        <Switch
          className="boards__switch"
          activeDirection={boardView === "templates" ? "left" : "right"}
          leftText={t("Templates.switchTitle")}
          rightText={t("Sessions.switchTitle")}
          toggle={switchView}
        />

        {/* desktop search  bar */}
        <SearchBar className="boards__search-bar" />

        {/* mobile search button + search bar (row below) */}
        <button className="boards__search-button" onClick={toggleMobileSearchBar}>
          <div className={classNames("boards__search-button-icon-container", {"boards__search-button-icon-container--active": showMobileSearchBar})}>
            <SearchIcon className="new-board__search-button-icon" aria-label="icon of magnifying glass" />
          </div>
        </button>
        {showMobileSearchBar && <SearchBar className="boards__mobile-search-bar" closable onClose={toggleMobileSearchBar} />}

        <main className="boards__outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
