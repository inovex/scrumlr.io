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

  const toggleHotkeys = () => {
    if (state.hotkeysAreActive) {
      Toast.info({title: t("Hotkeys.hotkeysDisabled"), autoClose: 1500});
    } else {
      Toast.info({title: t("Hotkeys.hotkeysEnabled"), autoClose: 1500});
    }
    dispatch(Actions.setHotkeyState(!state.hotkeysAreActive));
  };

  const toggleModeration = () => {
    if (state.moderation) {
      dispatch(Actions.stopSharing());
      dispatch(Actions.clearFocusInitiator());
    } else {
      dispatch(Actions.setFocusInitiator(state.currentUser));
      if (note.current) dispatch(Actions.shareNote(note.current));
    }
    dispatch(Actions.setModerating(!state.moderation));
  };

  const toggleReadyState = () => {
    dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, !isReady));
  };

  const toggleRaiseHand = () => {
    dispatch(Actions.setRaisedHand(state.currentUser.user.id, !raisedHand));
  };

  const startTimer = (minutes: number) => {
    dispatch(Actions.setTimer(minutes));
    Toast.info({title: `${t("TimerToggleButton.customTime")}: ${minutes} ${t("TimerToggleButton.min")}`});
  };

  const showSettings = () => navigate("settings");

  useHotkeys(TOGGLE_HOTKEYS, toggleHotkeys, [state.hotkeysAreActive]);
  useHotkeys(TOGGLE_MODERATION, toggleModeration, hotkeyOptions, [state.moderation]);
  useHotkeys(TOGGLE_READY_STATE, toggleReadyState, hotkeyOptions, [isReady]);
  useHotkeys(TOGGLE_RAISED_HAND, toggleRaiseHand, hotkeyOptions, [raisedHand]);
  useHotkeys(SHOW_SETTINGS, showSettings, hotkeyOptions);
  useHotkeys(
    TOGGLE_SHOW_AUTHORS,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.editBoard({showAuthors: !state.showAuthors}));
    },
    hotkeyOptionsAdmin,
    [state.showAuthors]
  );
  useHotkeys(
    TOGGLE_SHOW_OTHER_USERS_NOTES,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.editBoard({showNotesOfOtherUsers: !state.showNotesOfOtherUsers}));
    },
    hotkeyOptionsAdmin,
    [state.showNotesOfOtherUsers]
  );
  useHotkeys(
    TOGGLE_COLUMN_VISIBILITY,
    (e: KeyboardEvent) => {
      e.preventDefault();
      dispatch(Actions.setShowHiddenColumns(!state.showHiddenColumns));
    },
    hotkeyOptionsAdmin,
    [state.showHiddenColumns]
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
