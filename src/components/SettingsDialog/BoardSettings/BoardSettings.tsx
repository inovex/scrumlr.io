import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {ChangeEvent, Fragment, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {AccessPolicy, deleteBoard, editBoard, setHotkeyState, setShowHiddenColumns} from "store/features";
import {OpenIcon, LockClosedIcon, KeyProtectedIcon, TrashIcon, InfoIcon} from "components/Icon";
import {DEFAULT_BOARD_NAME, MIN_PASSWORD_LENGTH, TOAST_TIMER_SHORT} from "constants/misc";
import {Toast} from "utils/Toast";
import {Toggle} from "components/Toggle";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {isEqual} from "underscore";
import {MenuItemConfig} from "constants/settings";
import {getColorClassName} from "constants/colors";
import {useOutletContext} from "react-router";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsInput} from "../Components/SettingsInput";
import "./BoardSettings.scss";

const POLICY_LABEL_KEYS: Record<AccessPolicy, string> = {
  PUBLIC: "BoardSettings.AccessPolicyPublicLabel",
  BY_INVITE: "BoardSettings.AccessPolicyByInviteLabel",
  BY_PASSPHRASE: "BoardSettings.AccessPolicyByPassphraseLabel",
};

export const BoardSettings = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const activeMenuItem: MenuItemConfig = useOutletContext();

  const state = useAppSelector(
    (applicationState) => ({
      board: applicationState.board.data!,
      me: applicationState.participants?.self,
      currentUserIsModerator: applicationState.participants?.self?.role === "OWNER" || applicationState.participants?.self?.role === "MODERATOR",
      hotkeysAreActive: applicationState.view.hotkeysAreActive,
    }),
    isEqual
  );

  const [boardName, setBoardName] = useState<string>(state.board.name ?? "");
  const [password, setPassword] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  const [localPolicy, setLocalPolicy] = useState(state.board.accessPolicy);
  const lastSubmittedPassword = useRef("");

  useEffect(() => {
    setBoardName(state.board.name ?? "");
  }, [state.board.name]);

  useEffect(() => {
    setLocalPolicy(state.board.accessPolicy);
  }, [state.board.accessPolicy]);

  const handlePolicyChange = (policy: AccessPolicy) => {
    if (policy === localPolicy) return;
    setLocalPolicy(policy);
    if (policy === "PUBLIC" || policy === "BY_INVITE") {
      dispatch(editBoard({accessPolicy: policy}));
      setPassword("");
      lastSubmittedPassword.current = "";
      Toast.success({title: t("Toast.accessPolicyChanged", {policy: t(POLICY_LABEL_KEYS[policy])}), autoClose: TOAST_TIMER_SHORT});
    }
  };

  const handlePasswordSubmit = () => {
    if (password.length >= MIN_PASSWORD_LENGTH && password !== lastSubmittedPassword.current) {
      lastSubmittedPassword.current = password;
      dispatch(editBoard({accessPolicy: "BY_PASSPHRASE", passphrase: password}));
      navigator.clipboard
        .writeText(password)
        .then(() => Toast.success({title: t("Toast.accessPolicyChanged", {policy: t(POLICY_LABEL_KEYS.BY_PASSPHRASE)}), autoClose: TOAST_TIMER_SHORT}));
    }
  };

  const ACCESS_POLICY_OPTIONS = [
    {policy: "PUBLIC" as const, icon: <OpenIcon />, label: t("BoardSettings.AccessPolicyPublicLabel")},
    {policy: "BY_INVITE" as const, icon: <LockClosedIcon />, label: t("BoardSettings.AccessPolicyByInviteLabel")},
    {policy: "BY_PASSPHRASE" as const, icon: <KeyProtectedIcon />, label: t("BoardSettings.AccessPolicyByPassphraseLabel")},
  ];

  return (
    <div className={classNames("settings-dialog__container", getColorClassName(activeMenuItem?.color))}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.BoardSettings")}</h2>
      </header>
      <div className="board-settings__container-wrapper">
        <div className="board-settings__container">
          <SettingsInput
            data-clarity-mask="True"
            value={boardName}
            id="boardSettingsBoardName"
            label={t("BoardSettings.BoardName")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardName(e.target.value)}
            submit={() => dispatch(editBoard({name: boardName}))}
            disabled={!state.currentUserIsModerator}
            placeholder={DEFAULT_BOARD_NAME}
            maxLength={128}
          />

          <div className="settings-dialog__group board-settings__access-policy-selector">
            {ACCESS_POLICY_OPTIONS.map(({policy, icon, label}, index) => (
              <Fragment key={policy}>
                {index > 0 && <hr className="settings-dialog__separator" />}
                <button
                  className={classNames("board-settings__access-option", {"board-settings__access-option--selected": localPolicy === policy})}
                  onClick={() => state.currentUserIsModerator && handlePolicyChange(policy)}
                  disabled={!state.currentUserIsModerator}
                  role="radio"
                  aria-checked={localPolicy === policy}
                >
                  <div className="board-settings__access-option-label">
                    <span className="board-settings__access-option-icon">{icon}</span>
                    <span className="board-settings__access-option-text">{label}</span>
                  </div>
                  <div className="board-settings__access-option-indicator" />
                </button>
              </Fragment>
            ))}
            {localPolicy === "BY_PASSPHRASE" && state.currentUserIsModerator && (
              <div className="board-settings__password-section">
                <SettingsInput
                  id="boardSettingsPassword"
                  label={t("BoardSettings.Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  submit={handlePasswordSubmit}
                  type="password"
                  passwordToggle
                  alwaysShowPasswordToggle
                />
              </div>
            )}
          </div>
          {state.currentUserIsModerator && (
            <>
              <div className="settings-dialog__group">
                <SettingsButton
                  data-testid="note-repositioning"
                  className="board-settings__allow-note-repositioning-button"
                  label={t("BoardSettings.AllowNoteRepositioningOption")}
                  onClick={() => dispatch(editBoard({allowStacking: !state.board.allowStacking}))}
                  role="switch"
                  aria-checked={state.board.allowStacking}
                >
                  <div className="board-settings__allow-note-repositioning-value">
                    <Toggle active={state.board.allowStacking} />
                  </div>
                </SettingsButton>
                <SettingsButton
                  className="board-settings__allow-board-editing"
                  label={t("BoardSettings.IsLocked")}
                  onClick={() => dispatch(editBoard({isLocked: !state.board.isLocked}))}
                  role="switch"
                  aria-checked={state.board.isLocked}
                >
                  <div className="board-settings__allow-board-editing-value">
                    <Toggle active={state.board.isLocked} />
                  </div>
                </SettingsButton>
              </div>
              <div className="settings-dialog__group">
                <SettingsButton
                  data-testid="author"
                  className="board-settings__show-author-button"
                  label={t("BoardSettings.ShowAuthorOption")}
                  onClick={() => {
                    dispatch(editBoard({showAuthors: !state.board.showAuthors}));
                  }}
                  role="switch"
                  aria-checked={state.board.showAuthors}
                >
                  <div className="board-settings__show-author-value">
                    <Toggle active={state.board.showAuthors} />
                  </div>
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="notes"
                  className="board-settings__show-notes-button"
                  label={t("BoardSettings.ShowOtherUsersNotesOption")}
                  onClick={() => dispatch(editBoard({showNotesOfOtherUsers: !state.board.showNotesOfOtherUsers}))}
                  role="switch"
                  aria-checked={state.board.showNotesOfOtherUsers}
                >
                  <div className="board-settings__show-notes-value">
                    <Toggle active={state.board.showNotesOfOtherUsers} />
                  </div>
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="reactions"
                  className="board-settings__show-reactions-button"
                  label={t("BoardSettings.ShowNoteReactionsOptions")}
                  onClick={() => dispatch(editBoard({showNoteReactions: !state.board.showNoteReactions}))}
                  role="switch"
                  aria-checked={state.board.showNoteReactions}
                >
                  <div className="board-settings__show-reactions-value">
                    <Toggle active={state.board.showNoteReactions} />
                  </div>
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="columns"
                  className="board-settings__show-columns-button"
                  label={t("BoardSettings.ShowHiddenColumnsOption")}
                  onClick={() => dispatch(setShowHiddenColumns({showHiddenColumns: !state.me?.showHiddenColumns}))}
                  role="switch"
                  aria-checked={!!state.me?.showHiddenColumns}
                >
                  <div className="board-settings__show-columns-value">
                    <Toggle active={!!state.me?.showHiddenColumns} />
                  </div>
                </SettingsButton>
              </div>

              <div className="board-settings__hotkey-settings">
                <SettingsButton
                  className="board-settings__toggle-hotkeys-button"
                  label={t("Hotkeys.hotkeyToggle")}
                  onClick={() => {
                    dispatch(setHotkeyState(!state.hotkeysAreActive));
                  }}
                >
                  <Toggle active={state.hotkeysAreActive} />
                </SettingsButton>
                <a className="board-settings__open-cheat-sheet-button" href={`${import.meta.env.BASE_URL}hotkeys.pdf`} target="_blank" rel="noopener noreferrer">
                  <p>{t("Hotkeys.cheatSheet")}</p>
                  <InfoIcon />
                </a>
              </div>

              <SettingsButton
                className={classNames("board-settings__delete-button")}
                label={t("BoardSettings.DeleteBoard")}
                onClick={() => setShowConfirmationDialog(true)}
                icon={TrashIcon}
                reverseOrder
              />
            </>
          )}

          {showConfirmationDialog && (
            <ConfirmationDialog
              title={t("ConfirmationDialog.deleteBoard")}
              onAccept={() => dispatch(deleteBoard())}
              onDecline={() => setShowConfirmationDialog(false)}
              icon={TrashIcon}
              warning
            />
          )}
        </div>
      </div>
    </div>
  );
};
