import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import _ from "underscore";
import classNames from "classnames";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as RaiseHand} from "assets/icon-hand.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as SettingsIcon} from "assets/icon-settings.svg";
import {ReactComponent as FocusIcon} from "assets/icon-focus.svg";
import {ReactComponent as MenuIcon} from "assets/icon-menu.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import {useHotkeys} from "react-hotkeys-hook";
import {hotkeyMap} from "constants/hotkeys";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import "./MenuBars.scss";

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
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [menuBarsMobileRef, fabIsExpanded]);

  const {SHOW_TIMER_MENU, SHOW_VOTING_MENU, SHOW_SETTINGS, TOGGLE_RAISED_HAND, TOGGLE_READY_STATE, TOGGLE_MODERATION} = hotkeyMap;

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
      showAuthors: rootState.board.data?.showAuthors,
      showNotesOfOtherUsers: rootState.board.data?.showNotesOfOtherUsers,
      showHiddenColumns: rootState.participants!.self.showHiddenColumns,
      hotkeysAreActive: rootState.view.hotkeysAreActive,
      activeTimer: !!rootState.board.data?.timerEnd,
      activeVoting: !!rootState.votings.open,
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
    if (state.moderation) {
      dispatch(Actions.stopSharing());
      dispatch(Actions.clearFocusInitiator());
    } else dispatch(Actions.setFocusInitiator(state.currentUser));

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
      {/* desktop view */}
      <aside className="menu-bars">
        {/* role=any: toggle ready, toggle raise hand, options */}
        <section className="menu user-menu">
          <ul className="menu__items">
            <li>
              <TooltipButton
                direction="right"
                onClick={toggleReadyState}
                label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
                icon={CheckIcon}
                active={isReady}
                hotkeyKey={TOGGLE_READY_STATE.toUpperCase()}
              />
            </li>
            <li>
              <TooltipButton
                direction="right"
                label={raisedHand ? t("MenuBars.lowerHand") : t("MenuBars.raiseHand")}
                icon={RaiseHand}
                onClick={toggleRaiseHand}
                active={raisedHand}
                hotkeyKey={TOGGLE_RAISED_HAND.toUpperCase()}
              />
            </li>
            <li>
              <TooltipButton direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} hotkeyKey={SHOW_SETTINGS.toUpperCase()} />
            </li>
          </ul>

          <button className={classNames("menu-bars__navigation", {"menu-bars__navigation--visible": showPreviousColumn})} onClick={onPreviousColumn} aria-hidden>
            <LeftArrowIcon className="menu-bars__navigation-icon" />
          </button>
        </section>

        {/* role=moderator: timer, votes, presenter mode */}
        <section className={classNames("menu", "admin-menu", {"admin-menu--empty": !isAdmin})}>
          {isAdmin && (
            <ul className="menu__items">
              <li>
                <TooltipButton active={state.activeTimer} direction="left" label="Timer" onClick={showTimerMenu} icon={TimerIcon} hotkeyKey={SHOW_TIMER_MENU.toUpperCase()} />
              </li>
              <li>
                <TooltipButton active={state.activeVoting} direction="left" label="Voting" onClick={showVotingMenu} icon={VoteIcon} hotkeyKey={SHOW_VOTING_MENU.toUpperCase()} />
              </li>
              <li>
                <TooltipButton
                  active={state.moderation}
                  direction="left"
                  label={state.moderation ? t("MenuBars.stopPresenterMode") : t("MenuBars.startPresenterMode")}
                  icon={FocusIcon}
                  onClick={toggleModeration}
                  hotkeyKey={TOGGLE_MODERATION.toUpperCase()}
                />
              </li>
            </ul>
          )}

          <button
            className={classNames("menu-bars__navigation", {"menu-bars__navigation--empty": !isAdmin, "menu-bars__navigation--visible": showNextColumn})}
            onClick={onNextColumn}
            aria-hidden
          >
            <RightArrowIcon className="menu-bars__navigation-icon" />
          </button>
        </section>
      </aside>

      {/* mobile view */}
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

        {/* role=any: toggle ready, toggle raise hand, options */}
        {(fabIsExpanded || isReady || raisedHand) && (
          <ul
            className={classNames("menu-bars-mobile__options menu-bars-mobile__options--horizontal", {
              "menu-bars-mobile__options--isExpanded": fabIsExpanded,
              "menu-bars-mobile__options--hasActiveButton": isReady || raisedHand,
            })}
          >
            {(fabIsExpanded || isReady) && (
              <li className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--horizontal", {"menu-bars-mobile__fab-option--active": isReady})}>
                <TooltipButton
                  active={isReady}
                  direction="left"
                  label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
                  icon={CheckIcon}
                  onClick={toggleReadyState}
                />
              </li>
            )}
            {(fabIsExpanded || raisedHand) && (
              <li className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--horizontal", {"menu-bars-mobile__fab-option--active": raisedHand})}>
                <TooltipButton
                  active={raisedHand}
                  direction="left"
                  label={raisedHand ? t("MenuBars.lowerHand") : t("MenuBars.raiseHand")}
                  icon={RaiseHand}
                  onClick={toggleRaiseHand}
                />
              </li>
            )}
            {fabIsExpanded && (
              <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal">
                <TooltipButton direction="left" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} />
              </li>
            )}
          </ul>
        )}

        {/* role=moderator: timer, votes, presenter mode */}
        {isAdmin && (fabIsExpanded || state.moderation) && (
          <ul
            className={classNames("menu-bars-mobile__options menu-bars-mobile__options--vertical", {
              "menu-bars-mobile__options--isExpanded": fabIsExpanded,
              "menu-bars-mobile__options--hasActiveButton": state.moderation,
            })}
          >
            {fabIsExpanded && (
              <>
                <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical">
                  <TooltipButton direction="right" label="Timer" onClick={showTimerMenu} icon={TimerIcon} />
                </li>
                <li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical">
                  <TooltipButton direction="right" label="Voting" onClick={showVotingMenu} icon={VoteIcon} />
                </li>
              </>
            )}
            {(fabIsExpanded || state.moderation) && (
              <li className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--vertical", {"menu-bars-mobile__fab-option--active": state.moderation})}>
                <TooltipButton
                  active={state.moderation}
                  direction="right"
                  label={state.moderation ? t("MenuBars.stopPresenterMode") : t("MenuBars.startPresenterMode")}
                  icon={FocusIcon}
                  onClick={toggleModeration}
                />
              </li>
            )}
          </ul>
        )}
      </aside>
    </>
  );
};
