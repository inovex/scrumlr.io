import {useTranslation} from "react-i18next";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {UserPill} from "components/UserPill/UserPill";
import "./NewBoard.scss";

export const NewBoard = () => {
  const {t} = useTranslation();
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
            <input type="checkbox" />
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
