import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {Input} from "components/Input/Input";
import {Switch} from "components/Switch/Switch";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import classNames from "classnames";
import "./Boards.scss";

type BoardView = "templates" | "sessions" | "create";

export const Boards = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [boardView, setBoardView] = useState<BoardView>("templates");
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [searchBarInput, setSearchBarInput] = useState("");

  const toggleMobileSearchBar = () => {
    setShowMobileSearchBar((open) => !open);
  };

  // navigate to view that is currently not visible
  const switchView = () => {
    switch (boardView) {
      case "templates":
        navigate("sessions");
        break;
      case "sessions":
        navigate("templates");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const currentLocation = location.pathname.split("/").at(-1) as BoardView;
    setBoardView(currentLocation);
  }, [location]);

  const renderTitle = () => {
    switch (boardView) {
      case "templates":
        return t("Templates.title");
      case "sessions":
        return t("Sessions.title");
      case "create":
      default:
        return t("CreateBoard.title");
    }
  };

  const renderExpandedView = () =>
    boardView !== "create" ? (
      <>
        {/* switch - - - search */}
        <Switch
          className="boards__switch"
          activeDirection={boardView === "templates" ? "left" : "right"}
          leftText={t("Templates.switchTitle")}
          rightText={t("Sessions.switchTitle")}
          toggle={switchView}
        />

        {/* desktop search  bar */}
        <Input className="boards__search-bar" type="search" height="larger" placeholder={t("Input.placeholder.search")} input={searchBarInput} setInput={setSearchBarInput} />

        {/* mobile search button + search bar (row below) */}
        <button className="boards__search-button" onClick={toggleMobileSearchBar}>
          <div className={classNames("boards__search-button-icon-container", {"boards__search-button-icon-container--active": showMobileSearchBar})}>
            <SearchIcon className="new-board__search-button-icon" aria-label="icon of magnifying glass" />
          </div>
        </button>
        {showMobileSearchBar && (
          <Input
            className="boards__mobile-search-bar"
            type="search"
            height="larger"
            placeholder={t("Input.placeholder.search")}
            input={searchBarInput}
            setInput={setSearchBarInput}
          />
        )}
      </>
    ) : null;

  return (
    <div className="boards">
      <div className={classNames("boards__grid", {"boards__grid--with-view-options": boardView !== "create"})}>
        {/* logo - - - profile */}
        <div className="boards__scrumlr-logo-container">
          <a className="new-board__scrumlr-logo-href" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="new-board__scrumlr-logo" />
          </a>
        </div>

        {/* - - title - - */}
        <div className="boards__title">{renderTitle()}</div>

        <UserPill className="boards__user-pill" locationPrefix={boardView} />

        {renderExpandedView()}

        <main className="boards__outlet">
          <Outlet context={searchBarInput} />
        </main>
      </div>
    </div>
  );
};
