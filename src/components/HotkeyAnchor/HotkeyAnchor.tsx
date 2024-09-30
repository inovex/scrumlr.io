import _ from "underscore";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import {Toast} from "utils/Toast";
import {useAppDispatch, useAppSelector} from "store";
import {hotkeyMap} from "constants/hotkeys";
import "./HotkeyAnchor.scss";
import {useNavigate, useParams} from "react-router";
import {useEffect, useRef} from "react";
import {TOAST_TIMER_SHORT} from "constants/misc";
import {
  clearFocusInitiator,
  editBoard,
  setFocusInitiator,
  setHotkeyState,
  setModerating,
  setRaisedHandStatus,
  setShowHiddenColumns,
  setTimer,
  setUserReadyStatus,
  shareNote,
  stopSharing,
} from "store/features";

/**
 * Anchor for general hotkeys
 */
export const HotkeyAnchor = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {noteId} = useParams();
  const note = useRef<string | undefined>();

  // bugfix for noteId not being updated properly
  useEffect(() => {
    note.current = noteId;
  }, [noteId]);

  const {
    TOGGLE_MODERATION,
    TOGGLE_RAISED_HAND,
    TOGGLE_READY_STATE,
    TOGGLE_SETTINGS,
    TOGGLE_HOTKEYS,
    OPEN_HOTKEY_CHEATSHEET,
    TOGGLE_SHOW_AUTHORS,
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    TOGGLE_COLUMN_VISIBILITY,
    SET_TIMER_FIRST_KEY,
  } = hotkeyMap;

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self!,
      moderation: rootState.view.moderating,
      showAuthors: rootState.board.data?.showAuthors,
      showNotesOfOtherUsers: rootState.board.data?.showNotesOfOtherUsers,
      showHiddenColumns: rootState.participants!.self!.showHiddenColumns,
      hotkeysAreActive: rootState.view.hotkeysAreActive,
      hotkeyNotificationsEnabled: rootState.view.hotkeyNotificationsEnabled,
    }),
    _.isEqual
  );

  const {raisedHand} = state.currentUser;
  const isAdmin = state.currentUser.role === "OWNER" || state.currentUser.role === "MODERATOR";
  const isReady = state.currentUser.ready;

  const hotkeyOptions = {
    enabled: state.hotkeysAreActive,
  };
  const hotkeyOptionsAdmin = {
    enabled: state.hotkeysAreActive && isAdmin,
  };

  const dispatchHotkeyNotification = (title: string) => {
    if (state.hotkeyNotificationsEnabled) {
      Toast.info({title, autoClose: TOAST_TIMER_SHORT});
    }
  };

  const toggleHotkeys = () => {
    if (state.hotkeysAreActive) {
      dispatch(setHotkeyState(false));
      dispatchHotkeyNotification(t("Hotkeys.hotkeysDisabled"));
    } else {
      dispatch(setHotkeyState(true));
      dispatchHotkeyNotification(t("Hotkeys.hotkeysEnabled"));
    }
  };

  const openHotkeyCheatsheet = () => window.open("/hotkeys.pdf", "_blank");

  const toggleModeration = () => {
    if (state.moderation) {
      dispatch(stopSharing());
      dispatch(clearFocusInitiator());
      dispatch(setModerating(false));
      dispatchHotkeyNotification(t("Hotkeys.togglePresentationMode.endPresenting"));
    } else {
      dispatch(setFocusInitiator(state.currentUser));
      if (note.current) dispatch(shareNote(note.current));
      dispatch(setModerating(true));
      dispatchHotkeyNotification(t("Hotkeys.togglePresentationMode.startPresenting"));
    }
  };

  const toggleReadyState = () => {
    if (isReady) {
      dispatch(setUserReadyStatus({userId: state.currentUser.user.id, ready: false}));
      dispatchHotkeyNotification(t("Hotkeys.toggleReadyState.notReady"));
    } else {
      dispatch(setUserReadyStatus({userId: state.currentUser.user.id, ready: true}));
      dispatchHotkeyNotification(t("Hotkeys.toggleReadyState.ready"));
    }
  };

  const toggleRaiseHand = () => {
    if (raisedHand) {
      dispatch(setRaisedHandStatus({userId: state.currentUser.user.id, raisedHand: false}));
      dispatchHotkeyNotification(t("Hotkeys.toggleRaisedHand.lower"));
    } else {
      dispatch(setRaisedHandStatus({userId: state.currentUser.user.id, raisedHand: true}));
      dispatchHotkeyNotification(t("Hotkeys.toggleRaisedHand.raise"));
    }
  };

  const startTimer = (minutes: number) => {
    dispatch(setTimer(minutes));
    dispatchHotkeyNotification(t("Hotkeys.timerStarted", {duration: minutes}));
  };

  const toggleSettings = () => (window.location.pathname.includes("settings") ? navigate("") : navigate("settings/board"));

  useHotkeys(TOGGLE_HOTKEYS, toggleHotkeys, [state.hotkeysAreActive, state.hotkeyNotificationsEnabled]);
  useHotkeys(OPEN_HOTKEY_CHEATSHEET, openHotkeyCheatsheet, hotkeyOptions);
  useHotkeys(TOGGLE_MODERATION, toggleModeration, hotkeyOptions, [state.moderation, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_READY_STATE, toggleReadyState, hotkeyOptions, [isReady, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_RAISED_HAND, toggleRaiseHand, hotkeyOptions, [raisedHand, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_SETTINGS, toggleSettings, hotkeyOptions);
  useHotkeys(
    TOGGLE_SHOW_AUTHORS,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (state.showAuthors) {
        dispatch(editBoard({showAuthors: false}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowAuthors.hide"));
      } else {
        dispatch(editBoard({showAuthors: true}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowAuthors.show"));
      }
    },
    hotkeyOptionsAdmin,
    [state.showAuthors, state.hotkeyNotificationsEnabled]
  );
  useHotkeys(
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (state.showNotesOfOtherUsers) {
        dispatch(editBoard({showNotesOfOtherUsers: false}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowOtherUsersNotes.hide"));
      } else {
        dispatch(editBoard({showNotesOfOtherUsers: true}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowOtherUsersNotes.show"));
      }
    },
    hotkeyOptionsAdmin,
    [state.showNotesOfOtherUsers, state.hotkeyNotificationsEnabled]
  );
  useHotkeys(
    TOGGLE_COLUMN_VISIBILITY,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (state.showHiddenColumns) {
        dispatch(setShowHiddenColumns({showHiddenColumns: false}));
        dispatchHotkeyNotification(t("Hotkeys.toggleColumnVisibility.hide"));
      } else {
        dispatch(setShowHiddenColumns({showHiddenColumns: true}));
        dispatchHotkeyNotification(t("Hotkeys.toggleColumnVisibility.show"));
      }
    },
    hotkeyOptionsAdmin,
    [state.showHiddenColumns, state.hotkeyNotificationsEnabled]
  );
  const hotkeyTimerCombo = SET_TIMER_FIRST_KEY.map((firstKey) => _.range(1, 10).map((minute) => `${firstKey}+${minute}`)).join(",");
  useHotkeys(hotkeyTimerCombo, (e) => {
    e.preventDefault();
    const minutes = Number(e.key);
    if (minutes && minutes > 0) {
      startTimer(minutes);
    }
  });

  return <div className="hotkey-anchor" />;
};
