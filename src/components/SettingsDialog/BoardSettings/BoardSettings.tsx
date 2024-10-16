import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {ChangeEvent, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {deleteBoard, editBoard, setShowHiddenColumns} from "store/features";
import {LockClosed, Trash, Refresh} from "components/Icon";
import {DEFAULT_BOARD_NAME, MIN_PASSWORD_LENGTH, PLACEHOLDER_PASSWORD, TOAST_TIMER_SHORT} from "constants/misc";
import {Toast} from "utils/Toast";
import {generateRandomString} from "utils/random";
import {Toggle} from "components/Toggle";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {isEqual} from "underscore";
import {MenuItemConfig} from "constants/settings";
import {getColorClassName} from "constants/colors";
import {useOutletContext} from "react-router";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsInput} from "../Components/SettingsInput";
import "./BoardSettings.scss";

export const BoardSettings = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const activeMenuItem: MenuItemConfig = useOutletContext();

  const state = useAppSelector(
    (applicationState) => ({
      board: applicationState.board.data!,
      me: applicationState.participants?.self,
      currentUserIsModerator: applicationState.participants?.self?.role === "OWNER" || applicationState.participants?.self?.role === "MODERATOR",
    }),
    isEqual
  );

  const [boardName, setBoardName] = useState<string>(state.board.name ?? "");
  const [password, setPassword] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  const [isProtectedOnInitialSettingsOpen, setIsProtectedOnInitialSettingsOpen] = useState(state.board.accessPolicy === "BY_PASSPHRASE");
  const [isProtected, setIsProtected] = useState(state.board.accessPolicy === "BY_PASSPHRASE");

  const isByInvite = state.board.accessPolicy === "BY_INVITE";

  useEffect(() => {
    setBoardName(state.board.name ?? "");
  }, [state.board.name]);

  useEffect(() => {
    setIsProtected(state.board.accessPolicy === "BY_PASSPHRASE");
  }, [state.board.accessPolicy]);

  const handleSetPassword = (newPassword: string) => {
    setPassword(newPassword);
    if (newPassword.length >= MIN_PASSWORD_LENGTH) {
      dispatch(editBoard({accessPolicy: "BY_PASSPHRASE", passphrase: newPassword}));
      navigator.clipboard.writeText(newPassword).then(() => Toast.success({title: t("Toast.passwordCopied"), autoClose: TOAST_TIMER_SHORT}));
      setIsProtected(true);
    } else if (isProtected || isProtectedOnInitialSettingsOpen) {
      dispatch(editBoard({accessPolicy: "PUBLIC"}));
      setIsProtectedOnInitialSettingsOpen(false);
      setIsProtected(false);
      Toast.info({title: t("Toast.boardMadePublic"), autoClose: TOAST_TIMER_SHORT});
    }
  };

  const getPasswordManagementButton = () => {
    if (isProtected) {
      return (
        <button
          className="board-settings__password-management-button board-settings__remove-protection-button button--centered"
          onClick={() => {
            handleSetPassword("");
          }}
        >
          <LockClosed />
          <span className="board-settings__password-management-text">{t("BoardSettings.SetAccessPolicyOpen")}</span>
        </button>
      );
    }
    if (!password) {
      return (
        <button
          className="board-settings__password-management-button board-settings__generate-password-button"
          onClick={() => {
            const pw = generateRandomString();
            handleSetPassword(pw);
          }}
        >
          <Refresh />
          <span className="board-settings__password-management-text">{t("BoardSettings.generatePassword")}</span>
        </button>
      );
    }
    return <span className="board-settings__password-input-hint board-settings__password-management-text">{t("BoardSettings.SecurePasswordHint")}</span>;
  };

  const getAccessPolicyTitle = () => {
    if (isByInvite)
      return (
        <>
          <span>{t("AccessPolicySelection.manualVerificationTitle")}</span>
          <LockClosed />
        </>
      );
    return !isProtected ? (
      <span>{t("AccessPolicySelection.publicTitle")}</span>
    ) : (
      <>
        <span>{t("AccessPolicySelection.byPassphraseTitle")}</span>
        <LockClosed />
      </>
    );
  };

  return (
    <div className={classNames("settings-dialog__container", getColorClassName(activeMenuItem?.color))}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.BoardSettings")}</h2>
      </header>
      <div className="board-settings__container-wrapper">
        <div className="board-settings__container">
          <SettingsInput
            value={boardName}
            id="boardSettingsBoardName"
            label={t("BoardSettings.BoardName")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardName(e.target.value)}
            submit={() => dispatch(editBoard({name: boardName}))}
            disabled={!state.currentUserIsModerator}
            placeholder={DEFAULT_BOARD_NAME}
            maxLength={128}
          />

          <div className="board-settings__group-and-button">
            <div className="settings-dialog__group">
              <SettingsButton className="board-settings__policy-button" label={t("BoardSettings.AccessPolicy")} disabled>
                <div className="board-settings__policy-button_value">{getAccessPolicyTitle()}</div>
              </SettingsButton>
              {!isByInvite && state.currentUserIsModerator && (
                <>
                  <hr className="settings-dialog__separator" />
                  <SettingsInput
                    id="boardSettingsPassword"
                    label={t("BoardSettings.Password")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    submit={() => handleSetPassword(password)}
                    type="password"
                    placeholder={!password && !isProtected ? undefined : PLACEHOLDER_PASSWORD}
                    passwordToggle
                  />
                </>
              )}
            </div>

            {!isByInvite && state.currentUserIsModerator && getPasswordManagementButton()}
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

              <SettingsButton
                className={classNames("board-settings__delete-button")}
                label={t("BoardSettings.DeleteBoard")}
                onClick={() => setShowConfirmationDialog(true)}
                icon={Trash}
              />
            </>
          )}

          {showConfirmationDialog && (
            <ConfirmationDialog
              title={t("ConfirmationDialog.deleteBoard")}
              onAccept={() => dispatch(deleteBoard())}
              onDecline={() => setShowConfirmationDialog(false)}
              icon={Trash}
              warning
            />
          )}
        </div>
      </div>
    </div>
  );
};
