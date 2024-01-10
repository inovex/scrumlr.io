import _ from "underscore";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {useHotkeys} from "react-hotkeys-hook";
import {Toast} from "utils/Toast";
import {Actions} from "store/action";
import {useAppSelector} from "store";
import {hotkeyMap} from "constants/hotkeys";
import "./HotkeyAnchor.scss";
import {useNavigate, useParams} from "react-router";
import {useEffect, useRef} from "react";
import {TOAST_TIMER_SHORT} from "constants/misc";

/**
 * Anchor for general hotkeys
 */
export const HotkeyAnchor = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
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
    SHOW_SETTINGS,
    TOGGLE_HOTKEYS,
    TOGGLE_SHOW_AUTHORS,
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    TOGGLE_COLUMN_VISIBILITY,
    SET_TIMER_FIRST_KEY,
  } = hotkeyMap;

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
      showAuthors: rootState.board.data?.showAuthors,
      showNotesOfOtherUsers: rootState.board.data?.showNotesOfOtherUsers,
      showHiddenColumns: rootState.participants!.self.showHiddenColumns,
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
      dispatch(Actions.setHotkeyState(false));
      dispatchHotkeyNotification(t("Hotkeys.hotkeysDisabled"));
    } else {
      dispatch(Actions.setHotkeyState(true));
      dispatchHotkeyNotification(t("Hotkeys.hotkeysEnabled"));
    }
  };

  const toggleModeration = () => {
    if (state.moderation) {
      dispatch(Actions.stopSharing());
      dispatch(Actions.clearFocusInitiator());
      dispatch(Actions.setModerating(false));
      dispatchHotkeyNotification(t("Hotkeys.togglePresentationMode.endPresenting"));
    } else {
      dispatch(Actions.setFocusInitiator(state.currentUser));
      if (note.current) dispatch(Actions.shareNote(note.current));
      dispatch(Actions.setModerating(true));
      dispatchHotkeyNotification(t("Hotkeys.togglePresentationMode.startPresenting"));
    }
  };

  const toggleReadyState = () => {
    if (isReady) {
      dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, false));
      dispatchHotkeyNotification(t("Hotkeys.toggleReadyState.notReady"));
    } else {
      dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, true));
      dispatchHotkeyNotification(t("Hotkeys.toggleReadyState.ready"));
    }
  };

  const toggleRaiseHand = () => {
    if (raisedHand) {
      dispatch(Actions.setRaisedHand(state.currentUser.user.id, false));
      dispatchHotkeyNotification(t("Hotkeys.toggleRaisedHand.lower"));
    } else {
      dispatch(Actions.setRaisedHand(state.currentUser.user.id, true));
      dispatchHotkeyNotification(t("Hotkeys.toggleRaisedHand.raise"));
    }
  };

  const startTimer = (minutes: number) => {
    dispatch(Actions.setTimer(minutes));
    Toast.info({title: `A timer with ${minutes} ${t("TimerToggleButton.min")} has been started`});
  };

  const showSettings = () => navigate("settings");

  useHotkeys(TOGGLE_HOTKEYS, toggleHotkeys, [state.hotkeysAreActive, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_MODERATION, toggleModeration, hotkeyOptions, [state.moderation, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_READY_STATE, toggleReadyState, hotkeyOptions, [isReady, state.hotkeyNotificationsEnabled]);
  useHotkeys(TOGGLE_RAISED_HAND, toggleRaiseHand, hotkeyOptions, [raisedHand, state.hotkeyNotificationsEnabled]);
  useHotkeys(SHOW_SETTINGS, showSettings, hotkeyOptions);
  useHotkeys(
    TOGGLE_SHOW_AUTHORS,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (state.showAuthors) {
        dispatch(Actions.editBoard({showAuthors: false}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowAuthors.hide"));
      } else {
        dispatch(Actions.editBoard({showAuthors: true}));
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
        dispatch(Actions.editBoard({showNotesOfOtherUsers: false}));
        dispatchHotkeyNotification(t("Hotkeys.toggleShowOtherUsersNotes.hide"));
      } else {
        dispatch(Actions.editBoard({showNotesOfOtherUsers: true}));
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
        dispatch(Actions.setShowHiddenColumns(false));
        dispatchHotkeyNotification(t("Hotkeys.toggleColumnVisibility.hide"));
      } else {
        dispatch(Actions.setShowHiddenColumns(true));
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
