import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useParams} from "react-router";
import {useEffect, useState} from "react";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import {Input} from "components/Input/Input";
import classNames from "classnames";
import {getTemplates} from "store/features";
import {useAppDispatch} from "store";
import "./Boards.scss";

// keeps track of the current view, i.e. sub route
type BoardView = "templates" | "sessions" | "create" | "edit";

export const Boards = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const {id: editTemplateId} = useParams();
  // const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [boardView, setBoardView] = useState<BoardView>("templates");
  // a simplification of BoardView in order to change some render behaviour (e.g. conditional render of SearchBar)
  const viewType = ["templates", "sessions"].includes(boardView) ? "overview" : "edit";
  // for edit route, expand location prefix used for settings with the edit template uuid
  const locationPrefix = boardView === "edit" ? `edit/${editTemplateId}` : boardView;

  const [searchBarInput, setSearchBarInput] = useState("");

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
        {/* desktop search  bar */}
        <Input className="boards__search-bar" type="search" height="larger" placeholder={t("Input.placeholder.search")} input={searchBarInput} setInput={setSearchBarInput} />

        {/* mobile search button + search bar (row below) */}
        <Input
          className="boards__mobile-search-bar"
          type="search"
          height="larger"
          placeholder={t("Input.placeholder.search")}
          input={searchBarInput}
          setInput={setSearchBarInput}
        />
      </>
    ) : null;

  return (
    <div className="boards">
      <div className={classNames("boards__grid", `boards__grid--view-type-${viewType}`)}>
        {/* logo - - - profile */}
        <div className="boards__scrumlr-logo-container">
          <a className="new-board__scrumlr-logo-href" href="/" aria-label={t("BoardHeader.returnToHomepage")}>
            <ScrumlrLogo className="new-board__scrumlr-logo" />
          </a>
        </div>

        {/* - - title - - */}
        <div className="boards__title">{renderTitle()}</div>

        <UserPill className="boards__user-pill" locationPrefix={locationPrefix} />

        {renderExpandedView()}

        <main className={classNames("boards__outlet", {"boards__outlet--extended-top": viewType === "overview"})}>
          <Outlet context={{searchBarInput}} />
        </main>
      </div>
    </div>
  );
};
