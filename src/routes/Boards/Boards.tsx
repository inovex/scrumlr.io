import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {Input} from "components/Input/Input";
import {Switch} from "components/Switch/Switch";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import classNames from "classnames";
import {getTemplates} from "store/features";
import {useAppDispatch} from "store";
import "./Boards.scss";

// keeps track of the current view, i.e. sub route
type BoardView = "templates" | "sessions" | "create" | "edit";

export const Boards = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [boardView, setBoardView] = useState<BoardView>("templates");
  // a simplification of BoardView in order to change some render behaviour (e.g. conditional render of SearchBar)
  const viewType = ["templates", "sessions"].includes(boardView) ? "overview" : "edit";
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
    // first sub path after "/boards"
    const subRoute = location.pathname.split("/").filter(Boolean)[1] as BoardView;
    setBoardView(subRoute);
  }, [location]);

  // init templates
  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const renderTitle = () => {
    switch (boardView) {
      case "templates":
        return t("Templates.title");
      case "sessions":
        return t("Sessions.title");
      case "create":
        return t("Templates.TemplateEditor.createTitle");
      case "edit":
      default: // TS is smart enough to recognize boardView is exhaustive, but ESLint isn't
        return t("Templates.TemplateEditor.editTitle");
    }
  };

  const renderExpandedView = () =>
    viewType === "overview" ? (
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
      <div className={classNames("boards__grid", {"boards__grid--with-view-options": viewType === "overview"})}>
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

        <main className={classNames("boards__outlet", {"boards__outlet--extended-top": viewType === "overview"})}>
          <Outlet context={searchBarInput} />
        </main>
      </div>
    </div>
  );
};
