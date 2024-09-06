import {animated, useSpring} from "@react-spring/web";
import classNames from "classnames";
import {BoardReactionMenu} from "components/BoardReactionMenu/BoardReactionMenu";
import {AddStickerReaction, ArrowLeft, ArrowRight, Close, GeneralSettings, MarkAsDone, Menu, PresenterMode, RaiseHand, Timer, Voting} from "components/Icon";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import {hotkeyMap} from "constants/hotkeys";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router";
import {useAppDispatch, useAppSelector} from "store";
import {clearFocusInitiator, setFocusInitiator, setModerating, setRaisedHandStatus, setUserReadyStatus, stopSharing} from "store/features";
import _ from "underscore";
import {useTimer} from "../../utils/hooks/useTimerLeft";
import "./MenuBars.scss";

export interface MenuBarsProps {
  showPreviousColumn: boolean;
  showNextColumn: boolean;
  onPreviousColumn: () => void;
  onNextColumn: () => void;
}

// Mobile Transitions Configs
const springConfig = {mass: 1.25, friction: 20, tension: 240};

const defaultVerticalStart = {opacity: 0, transform: "translateY(100%)", config: springConfig};
const defaultVerticalStop = {opacity: 1, transform: "translateY(0%)", config: springConfig};

const defaultHorizontalStart = {opacity: 0, transform: "translateX(100%)", config: springConfig};
const defaultHorizontalStop = {opacity: 1, transform: "translateX(0%)", config: springConfig};

export const MenuBars = ({showPreviousColumn, showNextColumn, onPreviousColumn, onNextColumn}: MenuBarsProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const menuBarsMobileRef = useRef<HTMLElement>(null);
  const menuBarsDesktopRef = useRef<HTMLElement>(null);
  const boardReactionRef = useRef<HTMLDivElement>(null);

  const [fabIsExpanded, setFabIsExpanded] = useState(false);
  const [showBoardReactionsMenu, setShowBoardReactionsMenu] = useState(false);

  useEffect(() => {
    const closeMenuBar = (target: HTMLElement) => {
      // don't close if we're on the settings, voting or timer page
      if (["voting", "timer", "settings"].some((path) => window.location.pathname.includes(path))) {
        return;
      }

      // close menu fab if we click outside the menu (only relevant for mobile since that one isn't always visible)
      if (!menuBarsMobileRef.current?.contains(target)) {
        setFabIsExpanded(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      closeMenuBar(target);
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [menuBarsMobileRef, fabIsExpanded, showBoardReactionsMenu]);

  // close board reaction menu when going into settings menu
  useEffect(() => {
    if (location.pathname.includes("settings")) {
      setShowBoardReactionsMenu(false);
    }
  }, [location]);

  const {TOGGLE_TIMER_MENU, TOGGLE_VOTING_MENU, TOGGLE_SETTINGS, TOGGLE_RAISED_HAND, TOGGLE_BOARD_REACTION_MENU, TOGGLE_READY_STATE, TOGGLE_MODERATION} = hotkeyMap;
  // State & Functions
  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self!,
      moderation: rootState.view.moderating,
      hotkeysAreActive: rootState.view.hotkeysAreActive,
      activeTimer: !!rootState.board.data?.timerEnd,
      activeVoting: !!rootState.votings.open,
      usedVotes: rootState.votes.filter((v) => v.voting === rootState.votings.open?.id).length,
      possibleVotes: rootState.votings.open?.voteLimit,
      timerEnd: rootState.board.data?.timerEnd,
    }),
    _.isEqual
  );

  const isAdmin = state.currentUser.role === "OWNER" || state.currentUser.role === "MODERATOR";
  const isReady = state.currentUser.ready;
  const {raisedHand} = state.currentUser;

  const toggleReadyState = () => {
    dispatch(setUserReadyStatus({userId: state.currentUser.user.id, ready: !isReady}));
  };

  const toggleRaiseHand = () => {
    dispatch(setRaisedHandStatus({userId: state.currentUser.user.id, raisedHand: !raisedHand}));
  };

  const toggleBoardReactionsMenu = () => {
    setShowBoardReactionsMenu((show) => !show);
  };

  const toggleModeration = () => {
    if (state.moderation) {
      dispatch(stopSharing());
      dispatch(clearFocusInitiator());
    } else dispatch(setFocusInitiator(state.currentUser));

    dispatch(setModerating(!state.moderation));
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

  /**
   * Logic for "Mark me as Done" tooltip.
   * https://github.com/inovex/scrumlr.io/issues/4269
   */
  const timerExpired = useTimer(state.timerEnd);
  const [isReadyTooltipClass, setIsReadyTooltipClass] = useState("");
  /**
   * Logic for when a) a timer initially expired b) available votes are used up
   * and the "Mark me as Done" tooltip is not open.
   */
  const USED_VOTES = state.usedVotes === state.possibleVotes;
  const USER_NOT_READY = !state.currentUser.ready;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleTimeout = () => {
      setIsReadyTooltipClass("tooltip-button--content-extended");
      setTimeout(() => setIsReadyTooltipClass(""), 28000);
    };
    if ((timerExpired || USED_VOTES) && USER_NOT_READY && (state.activeTimer || state.activeVoting)) {
      timer = setTimeout(handleTimeout, 2000);
    }
    if (!USED_VOTES || !state.activeTimer || !USER_NOT_READY || !state.activeVoting) {
      setIsReadyTooltipClass("");
    }

    return () => clearTimeout(timer);
  }, [timerExpired, USER_NOT_READY, state.timerEnd, USED_VOTES, state.activeTimer, state.activeVoting]);

  return (
    <>
      {/* desktop view */}
      <aside className="menu-bars" ref={menuBarsDesktopRef}>
        {/* role=any: toggle ready, toggle raise hand, options */}
        <div className="menu__container">
          <section className="menu user-menu">
            <ul className="menu__items">
              <li>
                <TooltipButton
                  direction="right"
                  onClick={toggleReadyState}
                  label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
                  icon={MarkAsDone}
                  className={isReadyTooltipClass}
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
                  icon={AddStickerReaction}
                  onClick={toggleBoardReactionsMenu}
                  active={showBoardReactionsMenu}
                  hotkeyKey={TOGGLE_BOARD_REACTION_MENU.toUpperCase()}
                />
              </li>
              <li>
                <TooltipButton direction="right" label={t("MenuBars.settings")} onClick={showSettings} icon={GeneralSettings} hotkeyKey={TOGGLE_SETTINGS.toUpperCase()} />
              </li>
            </ul>
          </section>

          <button className={classNames("menu-bars__navigation", {"menu-bars__navigation--visible": showPreviousColumn})} onClick={onPreviousColumn} aria-hidden>
            <ArrowLeft className="menu-bars__navigation-icon" />
          </button>
        </div>

        {/* role=moderator: timer, votes, presenter mode */}
        <div className="menu__container">
          <section className={classNames("menu", "admin-menu", {"admin-menu--empty": !isAdmin})}>
            {isAdmin && (
              <ul className="menu__items">
                <li>
                  <TooltipButton active={state.activeTimer} direction="left" label="Timer" onClick={toggleTimerMenu} icon={Timer} hotkeyKey={TOGGLE_TIMER_MENU.toUpperCase()} />
                </li>
                <li>
                  <TooltipButton
                    active={state.activeVoting}
                    direction="left"
                    label="Voting"
                    onClick={toggleVotingMenu}
                    icon={Voting}
                    hotkeyKey={TOGGLE_VOTING_MENU.toUpperCase()}
                  />
                </li>
                <li>
                  <TooltipButton
                    active={state.moderation}
                    direction="left"
                    label={state.moderation ? t("MenuBars.stopPresenterMode") : t("MenuBars.startPresenterMode")}
                    icon={PresenterMode}
                    onClick={toggleModeration}
                    hotkeyKey={TOGGLE_MODERATION.toUpperCase()}
                  />
                </li>
              </ul>
            )}
          </section>
          <button className={classNames("menu-bars__navigation", {"menu-bars__navigation--visible": showNextColumn})} onClick={onNextColumn} aria-hidden>
            <ArrowRight className="menu-bars__navigation-icon" />
          </button>
        </div>
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
          {fabIsExpanded ? <Close aria-hidden /> : <Menu aria-hidden />}
        </button>

        {/* role=any: toggle ready, toggle raise hand, options */}
        <ul
          className={classNames("menu-bars-mobile__options menu-bars-mobile__options--horizontal", {
            "menu-bars-mobile__options--isExpanded": fabIsExpanded,
            "menu-bars-mobile__options--hasActiveButton": isReady || raisedHand,
          })}
        >
          <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--horizontal" style={settingsAnimation}>
            <TooltipButton disabled={!fabIsExpanded} direction="left" label={t("MenuBars.settings")} onClick={showSettings} icon={GeneralSettings} />
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
              icon={AddStickerReaction}
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
              icon={MarkAsDone}
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
                icon={PresenterMode}
                onClick={toggleModeration}
              />
            </animated.li>
            <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical" style={votingAnimation}>
              <TooltipButton disabled={!fabIsExpanded} direction="right" label="Voting" onClick={toggleVotingMenu} icon={Voting} />
            </animated.li>
            <animated.li className="menu-bars-mobile__fab-option menu-bars-mobile__fab-option--vertical" style={timerAnimation}>
              <TooltipButton disabled={!fabIsExpanded} direction="right" label="Timer" onClick={toggleTimerMenu} icon={Timer} />
            </animated.li>
          </ul>
        )}
      </aside>

      {/* should this be inside a Portal instead? */}
      <BoardReactionMenu ref={boardReactionRef} showMenu={showBoardReactionsMenu} close={toggleBoardReactionsMenu} />
    </>
  );
};
