import {useTranslation} from "react-i18next";
import {Outlet, useLocation, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {Input} from "components/Input/Input";
import {HeaderBar} from "components/HeaderBar";
import classNames from "classnames";
import {getTemplates} from "store/features";
import {useAppDispatch, useAppSelector} from "store";
import {ImportBoard, ImportBoardButton} from "components/ImportBoard";
import {Switch} from "components/Switch/Switch";
import {SearchIcon} from "components/Icon";
import "./Boards.scss";

// keeps track of the current view, i.e. sub route
type BoardView = "templates" | "sessions" | "create" | "edit";

export const Boards = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {id: editTemplateId} = useParams();
  const dispatch = useAppDispatch();

  const [boardView, setBoardView] = useState<BoardView>("templates");
  // a simplification of BoardView in order to change some render behaviour (e.g. conditional render of SearchBar)
  const viewType = ["templates", "sessions"].includes(boardView) ? "overview" : "edit";
  // for edit route, expand location prefix used for settings with the edit template uuid
  const locationPrefix = boardView === "edit" ? `edit/${editTemplateId}` : boardView;

  const [searchBarInput, setSearchBarInput] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous);
  const allowAnonymousBoardCreation = useAppSelector((state) => state.view.allowAnonymousBoardCreation);
  const canCreateBoard = !isAnonymous || allowAnonymousBoardCreation;

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

  return (
    <div className="boards">
      <HeaderBar renderTitle={renderTitle} locationPrefix={locationPrefix} />

      {viewType === "overview" && (
        <div className="boards__search-area">
          {/* view toggle */}
          <div className="boards__switch-wrapper">
            <Switch
              leftText={t("Templates.switchTitle")}
              rightText={t("Sessions.switchTitle")}
              activeDirection={boardView === "templates" ? "left" : "right"}
              toggle={() => navigate(boardView === "templates" ? "/boards/sessions" : "/boards/templates")}
            />
            <span className="boards__coming-soon-badge">Coming Soon</span>
          </div>

          {/* desktop search bar */}
          <Input className="boards__search-bar" type="search" height="larger" placeholder={t("Input.placeholder.search")} input={searchBarInput} setInput={setSearchBarInput} />

          {/* mobile search icon + import button grouped on the right */}
          <div className="boards__right-actions">
            <button
              className={classNames("boards__mobile-search-icon-container", {"boards__mobile-search-icon-container--active": showMobileSearch})}
              onClick={() => setShowMobileSearch((v) => !v)}
              aria-label={t("Input.placeholder.search")}
            >
              <SearchIcon />
            </button>

            {/* import button */}
            <ImportBoardButton className="boards__import-button" onClick={() => setShowImportModal(true)} allowImport={canCreateBoard} />
          </div>

          {/* mobile search bar (toggled) */}
          {showMobileSearch && (
            <Input
              className="boards__mobile-search-bar"
              type="search"
              height="normal"
              placeholder={t("Input.placeholder.search")}
              input={searchBarInput}
              setInput={setSearchBarInput}
            />
          )}
        </div>
      )}

      {showImportModal && <ImportBoard onClose={() => setShowImportModal(false)} />}

      <main className={classNames("boards__outlet", {"boards__outlet--extended-top": viewType === "overview"})}>
        <Outlet context={{searchBarInput}} />
      </main>
    </div>
  );
};
