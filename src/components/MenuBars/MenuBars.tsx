import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import _ from "underscore";
import classNames from "classnames";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as TimerIcon} from "assets/icon-timer.svg";
import {ReactComponent as RaiseHand} from "assets/icon-hand.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {ReactComponent as BoardReactionIcon} from "assets/icon-add-board-reaction.svg";
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
import {BoardReactionMenu} from "components/BoardReactionMenu/BoardReactionMenu";
import "./MenuBars.scss";
import {animated, useSpring} from "@react-spring/web";

export interface MenuBarsProps {
  showPreviousColumn: boolean;
  showNextColumn: boolean;
  onPreviousColumn: () => void;
  onNextColumn: () => void;
}

// Mobile Transitions Configs
const springConfig = {mass: 0.75, friction: 20, tension: 280};

const defaultVerticalStart = {opacity: 0, transform: "translateY(100%)", config: springConfig};
const defaultVerticalStop = {opacity: 1, transform: "translateY(0%)", config: springConfig};

const defaultHorizontalStart = {opacity: 0, transform: "translateX(100%)", config: springConfig};
const defaultHorizontalStop = {opacity: 1, transform: "translateX(0%)", config: springConfig};

export const MenuBars = ({showPreviousColumn, showNextColumn, onPreviousColumn, onNextColumn}: MenuBarsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuBarsMobileRef = useRef<HTMLElement>(null);
  const menuBarsDesktopRef = useRef<HTMLElement>(null);
  const boardReactionRef = useRef<HTMLDivElement>(null);

  const [fabIsExpanded, setFabIsExpanded] = useState(false);
  const [showBoardReactionsMenu, setShowBoardReactionsMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = ({target}: MouseEvent) => {
      if (boardReactionRef.current?.contains(target as Node)) {
        return;
      }

      if (!menuBarsMobileRef.current?.contains(target as Node)) {
        setFabIsExpanded(false);
      }

      // only hide if menu wasn't clicked to avoid double onClick toggle
      if (!(menuBarsDesktopRef.current?.contains(target as Node) || menuBarsMobileRef.current?.contains(target as Node))) {
        setShowBoardReactionsMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [menuBarsMobileRef, fabIsExpanded, showBoardReactionsMenu]);

  const {TOGGLE_TIMER_MENU, TOGGLE_VOTING_MENU, TOGGLE_SETTINGS, TOGGLE_RAISED_HAND, TOGGLE_BOARD_REACTION_MENU, TOGGLE_READY_STATE, TOGGLE_MODERATION} = hotkeyMap;

  // State & Functions
  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
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

  const toggleBoardReactionsMenu = () => {
    setShowBoardReactionsMenu((show) => !show);
  };

  const toggleModeration = () => {
    if (state.moderation) {
      dispatch(Actions.stopSharing());
      dispatch(Actions.clearFocusInitiator());
    } else dispatch(Actions.setFocusInitiator(state.currentUser));

    dispatch(Actions.setModerating(!state.moderation));
  };

  const toggleTimerMenu = () => (window.location.pathname.includes("timer") ? navigate("") : navigate("timer"));
  const toggleVotingMenu = () => (window.location.pathname.includes("voting") ? navigate("") : navigate("voting"));
  const showSettings = () => navigate("settings");

  // Mobile Transitions
  // vertical
  const [timerAnimation, timerApi] = useSpring(() => defaultVerticalStart);
  const [votingAnimation, votingApi] = useSpring(() => defaultVerticalStart);
  const [moderationAnimation, moderationApi] = useSpring(() => defaultVerticalStart);

  // horizontal
  const [reactionsAnimation, reactionsApi] = useSpring(() => defaultHorizontalStart);
  const [settingsAnimation, settingsApi] = useSpring(() => defaultHorizontalStart);
  const [raisedHandAnimation, raisedHandApi] = useSpring(() => defaultHorizontalStart);
  const [readyStateAnimation, readyStateApi] = useSpring(() => defaultHorizontalStart);

  // trigger animations before browser paints
  useLayoutEffect(() => {
    const getReadyStateTransform = () => {
      if (isReady) {
        if (raisedHand) {
          return "translateX(200%)";
        }
        return "translateX(300%)";
      }
      return "translateX(400%)";
    };

    const closeMenuTransforms = {
      timer: "translateY(300%)",
      voting: "translateY(200%)",
      moderation: state.moderation ? "translateY(0%)" : "translateY(100%)",
      reactions: "translateX(200%)",
      settings: "translateX(100%)",
      raisedHand: raisedHand ? "translateX(200%)" : "translateX(300%)",
      readyState: getReadyStateTransform(),
    };

    if (fabIsExpanded) {
      if (isAdmin) {
        timerApi.start(defaultVerticalStop);
        votingApi.start(defaultVerticalStop);
        moderationApi.start(defaultVerticalStop);
      }

      reactionsApi.start(defaultHorizontalStop);
      settingsApi.start(defaultHorizontalStop);
      raisedHandApi.start(defaultHorizontalStop);
      readyStateApi.start(defaultHorizontalStop);
    } else {
      if (isAdmin) {
        timerApi.start({...defaultVerticalStop, transform: closeMenuTransforms.timer});
        votingApi.start({...defaultVerticalStop, transform: closeMenuTransforms.voting});
        moderationApi.start({...defaultVerticalStop, transform: closeMenuTransforms.moderation});
      }

      reactionsApi.start({...defaultHorizontalStop, transform: closeMenuTransforms.reactions});
      settingsApi.start({...defaultHorizontalStop, transform: closeMenuTransforms.settings});
      raisedHandApi.start({...defaultHorizontalStop, transform: closeMenuTransforms.raisedHand});
      readyStateApi.start({...defaultHorizontalStop, transform: closeMenuTransforms.readyState});
    }
  }, [fabIsExpanded, raisedHand, isReady, reactionsApi, settingsApi, raisedHandApi, readyStateApi, timerApi, votingApi, moderationApi, state.moderation, isAdmin]);

  // Hotkeys
  // normal users
  const hotkeyOptionsUser = {
    enabled: state.hotkeysAreActive,
  };

  // admins
  const hotkeyOptionsAdmin = {
    enabled: hotkeyOptionsUser.enabled && isAdmin,
  };

  useHotkeys(TOGGLE_BOARD_REACTION_MENU, toggleBoardReactionsMenu, hotkeyOptionsUser, []);
  useHotkeys(TOGGLE_TIMER_MENU, toggleTimerMenu, hotkeyOptionsAdmin, []);
  useHotkeys(TOGGLE_VOTING_MENU, toggleVotingMenu, hotkeyOptionsAdmin, []);

  return (
    <>
      {/* desktop view */}
      <aside className="menu-bars" ref={menuBarsDesktopRef}>
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
              <TooltipButton
                direction="right"
                label={t("MenuBars.openBoardReactionMenu")}
                icon={BoardReactionIcon}
                onClick={toggleBoardReactionsMenu}
                active={showBoardReactionsMenu}
                hotkeyKey={TOGGLE_BOARD_REACTION_MENU.toUpperCase()}
              />
            </li>
            <li>
              <TooltipButton direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} hotkeyKey={TOGGLE_SETTINGS.toUpperCase()} />
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
                <TooltipButton active={state.activeTimer} direction="left" label="Timer" onClick={toggleTimerMenu} icon={TimerIcon} hotkeyKey={TOGGLE_TIMER_MENU.toUpperCase()} />
              </li>
              <li>
                <TooltipButton
                  active={state.activeVoting}
                  direction="left"
                  label="Voting"
                  onClick={toggleVotingMenu}
                  icon={VoteIcon}
                  hotkeyKey={TOGGLE_VOTING_MENU.toUpperCase()}
                />
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
            if (fabIsExpanded) setShowBoardReactionsMenu(false);
            setFabIsExpanded(!fabIsExpanded);
          }}
          aria-label={t("MenuBars.openMenu")}
        >
          {fabIsExpanded ? <CloseIcon aria-hidden /> : <MenuIcon aria-hidden />}
        </button>

        {/* role=any: toggle ready, toggle raise hand, options */}
        <ul
          className={classNames("menu-bars-mobile__options menu-bars-mobile__options--horizontal", {
            "menu-bars-mobile__options--isExpanded": fabIsExpanded,
            "menu-bars-mobile__options--hasActiveButton": isReady || raisedHand,
          })}
        >
          <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal" style={settingsAnimation}>
            <TooltipButton disabled={!fabIsExpanded} direction="left" label={t("MenuBars.settings")} onClick={showSettings} icon={SettingsIcon} />
          </animated.li>
          <animated.li
            className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--horizontal", {
              "menu-bars-mobile__fab-option--active": showBoardReactionsMenu,
            })}
            style={reactionsAnimation}
          >
            <TooltipButton
              disabled={!fabIsExpanded}
              active={showBoardReactionsMenu}
              direction="left"
              label={t("MenuBars.openBoardReactionMenu")}
              icon={BoardReactionIcon}
              onClick={toggleBoardReactionsMenu}
            />
          </animated.li>
          <animated.li
            className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--horizontal", {"menu-bars-mobile__fab-option--active": raisedHand})}
            style={raisedHandAnimation}
          >
            <TooltipButton
              disabled={!fabIsExpanded && !raisedHand}
              active={raisedHand}
              direction="left"
              label={raisedHand ? t("MenuBars.lowerHand") : t("MenuBars.raiseHand")}
              icon={RaiseHand}
              onClick={toggleRaiseHand}
            />
          </animated.li>
          <animated.li
            className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--horizontal", {"menu-bars-mobile__fab-option--active": isReady})}
            style={readyStateAnimation}
          >
            <TooltipButton
              disabled={!fabIsExpanded && !isReady}
              active={isReady}
              direction="left"
              label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
              icon={CheckIcon}
              onClick={toggleReadyState}
            />
          </animated.li>
        </ul>

        {/* role=moderator: timer, votes, presenter mode */}
        {isAdmin && (
          <ul
            className={classNames("menu-bars-mobile__options menu-bars-mobile__options--vertical", {
              "menu-bars-mobile__options--isExpanded": fabIsExpanded,
              "menu-bars-mobile__options--hasActiveButton": state.moderation,
            })}
          >
            <animated.li
              className={classNames("menu-bars-mobile__fab-option", "menu-bars-mobile__fab-option--vertical", {"menu-bars-mobile__fab-option--active": state.moderation})}
              style={moderationAnimation}
            >
              <TooltipButton
                disabled={!fabIsExpanded && !state.moderation}
                active={state.moderation}
                direction="right"
                label={state.moderation ? t("MenuBars.stopPresenterMode") : t("MenuBars.startPresenterMode")}
                icon={FocusIcon}
                onClick={toggleModeration}
              />
            </animated.li>
            <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical" style={votingAnimation}>
              <TooltipButton disabled={!fabIsExpanded} direction="right" label="Voting" onClick={toggleVotingMenu} icon={VoteIcon} />
            </animated.li>
            <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical" style={timerAnimation}>
              <TooltipButton disabled={!fabIsExpanded} direction="right" label="Timer" onClick={toggleTimerMenu} icon={TimerIcon} />
            </animated.li>
          </ul>
        )}
      </aside>

      {/* should this be inside a Portal instead? */}
      <div ref={boardReactionRef}>
        <BoardReactionMenu showMenu={showBoardReactionsMenu} close={toggleBoardReactionsMenu} />
      </div>
    </>
  );
};
