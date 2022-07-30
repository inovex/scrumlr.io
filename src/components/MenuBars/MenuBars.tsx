import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import _ from "underscore";
import classNames from "classnames";
import {MenuToggle, MenuButton} from "components/MenuBars/MenuItem";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as RaiseHand} from "assets/icon-hand.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as MenuIcon} from "assets/icon-menu.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import "./MenuBars.scss";
import {useHotkeys} from "react-hotkeys-hook";
import {hotkeyMap} from "constants/hotkeys";

export interface MenuBarsProps {
  showPreviousColumn: boolean;
  showNextColumn: boolean;
  onPreviousColumn: () => void;
  onNextColumn: () => void;
}

export const MenuBars = ({showPreviousColumn, showNextColumn, onPreviousColumn, onNextColumn}: MenuBarsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuBarsMobileRef = useRef<HTMLElement>(null);

  const [fabIsExpanded, setFabIsExpanded] = useState(false);

  useEffect(() => {
    const handleClickOutside = ({target}: MouseEvent) => {
      if (!menuBarsMobileRef.current?.contains(target as Node) && fabIsExpanded) {
        setFabIsExpanded(!fabIsExpanded);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuBarsMobileRef, fabIsExpanded]);

  const {SHOW_TIMER_MENU, SHOW_VOTING_MENU} = hotkeyMap;

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
      showAuthors: rootState.board.data?.showAuthors,
      showNotesOfOtherUsers: rootState.board.data?.showNotesOfOtherUsers,
      showHiddenColumns: rootState.participants!.self.showHiddenColumns,
      hotkeysAreActive: rootState.view.hotkeysAreActive,
    }),
    _.isEqual
  );

  const isAdmin = state.currentUser.role === "OWNER" || state.currentUser.role === "MODERATOR";
  const isReady = state.currentUser.ready;
  const {raisedHand} = state.currentUser;

  const toggleReadyState = () => {
    dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, !isReady));
  };

  const toggleRaiseHand = () => {
    dispatch(Actions.setRaisedHand(state.currentUser.user.id, !raisedHand));
  };

  const toggleModeration = () => {
    dispatch(Actions.setModerating(!state.moderation));
  };

  const showTimerMenu = () => navigate("timer");
  const showVotingMenu = () => navigate("voting");
  const showSettings = () => navigate("settings");

  const hotkeyOptionsAdmin = {
    enabled: state.hotkeysAreActive && isAdmin,
  };

  useHotkeys(SHOW_TIMER_MENU, showTimerMenu, hotkeyOptionsAdmin, []);
  useHotkeys(SHOW_VOTING_MENU, showVotingMenu, hotkeyOptionsAdmin, []);

  return (
    <>
      <aside className="menu-bars">
        <section className="menu user-menu">
          <ul className="menu__items">
            <li>
              <MenuToggle
                direction="right"
                value={isReady}
                toggleStartLabel={t("MenuBars.markAsDone")}
                toggleStopLabel={t("MenuBars.unmarkAsDone")}
                icon={CheckIcon}
                onToggle={toggleReadyState}
                tabIndex={TabIndex.UserMenu}
              />
            </li>
            <li>
              <MenuToggle
                tabIndex={TabIndex.UserMenu + 1}
                direction="right"
                toggleStartLabel={t("MenuBars.raiseHand")}
                toggleStopLabel={t("MenuBars.lowerHand")}
                icon={RaiseHand}
                onToggle={toggleRaiseHand}
                value={raisedHand}
              />
            </li>
            <li>
              <MenuButton tabIndex={TabIndex.UserMenu + 2} direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} />
            </li>
          </ul>

          <button
            className={classNames("menu-bars__navigation", {"menu-bars__navigation--visible": showPreviousColumn || showNextColumn})}
            disabled={!showPreviousColumn}
            onClick={onPreviousColumn}
            aria-hidden
          >
            <LeftArrowIcon className="menu-bars__navigation-icon" />
          </button>
        </section>

        <section className={classNames("menu", "admin-menu", {"admin-menu--empty": !isAdmin})}>
          {isAdmin && (
            <ul className="menu__items">
              <li>
                <MenuButton tabIndex={TabIndex.AdminMenu} direction="left" label="Timer" onClick={showTimerMenu} icon={TimerIcon} />
              </li>
              <li>
                <MenuButton tabIndex={TabIndex.AdminMenu + 1} direction="left" label="Voting" onClick={showVotingMenu} icon={VoteIcon} />
              </li>
              <li>
                <MenuToggle
                  value={state.moderation}
                  direction="left"
                  toggleStartLabel={t("MenuBars.startFocusMode")}
                  toggleStopLabel={t("MenuBars.stopFocusMode")}
                  icon={FocusIcon}
                  onToggle={toggleModeration}
                  tabIndex={TabIndex.AdminMenu + 2}
                />
              </li>
            </ul>
          )}

          <button
            className={classNames("menu-bars__navigation", {"menu-bars__navigation--empty": !isAdmin, "menu-bars__navigation--visible": showPreviousColumn || showNextColumn})}
            disabled={!showNextColumn}
            onClick={onNextColumn}
            aria-hidden
          >
            <RightArrowIcon className="menu-bars__navigation-icon" />
          </button>
        </section>
      </aside>
      <aside className="menu-bars-mobile" ref={menuBarsMobileRef}>
        <button
          className={classNames("menu-bars-mobile__fab menu-bars-mobile__fab-main", {"menu-bars-mobile__fab-main--isExpanded": fabIsExpanded})}
          onClick={() => {
            setFabIsExpanded(!fabIsExpanded);
          }}
          aria-label={t("MenuBars.openMenu")}
        >
          {fabIsExpanded ? <CloseIcon aria-hidden /> : <MenuIcon aria-hidden />}
        </button>
        {(fabIsExpanded || isReady || raisedHand) && (
          <ul
            className={classNames("menu-bars-mobile__options menu-bars-mobile__options--vertical", {
              "menu-bars-mobile__options--isExpanded": fabIsExpanded,
              "menu-bars-mobile__options--hasActiveButton": isReady || raisedHand,
            })}
          >
            {(fabIsExpanded || isReady) && (
              <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical">
                <MenuToggle
                  value={isReady}
                  direction="right"
                  toggleStartLabel={t("MenuBars.markAsDone")}
                  toggleStopLabel={t("MenuBars.unmarkAsDone")}
                  icon={CheckIcon}
                  onToggle={toggleReadyState}
                  tabIndex={TabIndex.UserMenu}
                />
              </li>
            )}
            {(fabIsExpanded || raisedHand) && (
              <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical">
                <MenuToggle
                  value={raisedHand}
                  direction="right"
                  toggleStartLabel={t("MenuBars.raiseHand")}
                  toggleStopLabel={t("MenuBars.lowerHand")}
                  icon={RaiseHand}
                  onToggle={toggleRaiseHand}
                  tabIndex={TabIndex.UserMenu + 1}
                />
              </li>
            )}
            {fabIsExpanded && (
              <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical">
                <MenuButton direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} />
              </li>
            )}
          </ul>
        )}
        {isAdmin && (fabIsExpanded || state.moderation) && (
          <ul
            className={classNames("menu-bars-mobile__options menu-bars-mobile__options--horizontal", {
              "menu-bars-mobile__options--isExpanded": fabIsExpanded,
              "menu-bars-mobile__options--hasActiveButton": state.moderation,
            })}
          >
            {fabIsExpanded && (
              <>
                <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal">
                  <MenuButton tabIndex={TabIndex.AdminMenu} direction="left" label="Timer" onClick={showTimerMenu} icon={TimerIcon} />
                </li>
                <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal">
                  <MenuButton tabIndex={TabIndex.AdminMenu + 1} direction="left" label="Voting" onClick={showVotingMenu} icon={VoteIcon} />
                </li>
              </>
            )}
            {(fabIsExpanded || state.moderation) && (
              <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal">
                <MenuToggle
                  value={state.moderation}
                  direction="left"
                  toggleStartLabel={t("MenuBars.startFocusMode")}
                  toggleStopLabel={t("MenuBars.stopFocusMode")}
                  icon={FocusIcon}
                  onToggle={toggleModeration}
                  tabIndex={TabIndex.AdminMenu + 2}
                />
              </li>
            )}
          </ul>
        )}
      </aside>
    </>
  );
};
