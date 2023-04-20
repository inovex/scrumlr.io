import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {ChangeEvent, useEffect, useState} from "react";
import {Actions} from "store/action";
import store, {useAppSelector} from "store";
import {ReactComponent as SetPolicyIcon} from "assets/icon-lock.svg";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as RefreshIcon} from "assets/icon-refresh.svg";
import {DEFAULT_BOARD_NAME, MIN_PASSWORD_LENGTH, PLACEHOLDER_PASSWORD, TOAST_TIMER_SHORT} from "constants/misc";
import {Toast} from "utils/Toast";
import {generateRandomString} from "utils/random";
import {Toggle} from "components/Toggle";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsInput} from "../Components/SettingsInput";
import "./BoardSettings.scss";

export const BoardSettings = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState) => ({
    board: applicationState.board.data!,
    me: applicationState.participants?.self,
    currentUserIsModerator: applicationState.participants?.self.role === "OWNER" || applicationState.participants?.self.role === "MODERATOR",
  }));

  const [boardName, setBoardName] = useState<string>(state.board.name ?? "");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
      store.dispatch(Actions.editBoard({accessPolicy: "BY_PASSPHRASE", passphrase: newPassword}));
      navigator.clipboard.writeText(newPassword).then(() => Toast.success({title: t("Toast.passwordCopied"), autoClose: TOAST_TIMER_SHORT}));
      setIsProtected(true);
    } else if (isProtected || isProtectedOnInitialSettingsOpen) {
      store.dispatch(Actions.editBoard({accessPolicy: "PUBLIC"}));
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
          <SetPolicyIcon />
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
          <RefreshIcon />
          <span className="board-settings__password-management-text">{t("BoardSettings.generatePassword")}</span>
        </button>
      );
    }
    return <span className="board-settings__password-input-hint board-settings__password-management-text">{t("BoardSettings.SecurePasswordHint")}</span>;
  };

  const getPasswordVisibilityButton = () =>
    showPassword ? (
      <VisibleIcon className="board-settings__show-password-button--enabled" onClick={() => setShowPassword(false)} />
    ) : (
      <HiddenIcon
        className={password ? "board-settings__show-password-button--enabled" : "board-settings__show-password-button--disabled"}
        onClick={() => password && setShowPassword(true)}
      />
    );

  const getAccessPolicyTitle = () => {
    if (isByInvite)
      return (
        <>
          <span>{t("AccessPolicySelection.manualVerificationTitle")}</span>
          <SetPolicyIcon />
        </>
      );
    return !isProtected ? (
      <span>{t("AccessPolicySelection.publicTitle")}</span>
    ) : (
      <>
        <span>{t("AccessPolicySelection.byPassphraseTitle")}</span>
        <SetPolicyIcon />
      </>
    );
  };

  return (
    <div className={classNames("settings-dialog__container", "accent-color__backlog-blue")}>
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
            submit={() => store.dispatch(Actions.editBoard({name: boardName}))}
            disabled={!state.currentUserIsModerator}
            placeholder={DEFAULT_BOARD_NAME}
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
                    type={showPassword ? "text" : "password"}
                    placeholder={!password && !isProtected ? undefined : PLACEHOLDER_PASSWORD}
                  >
                    {password && getPasswordVisibilityButton()}
                  </SettingsInput>
                </>
              )}
            </div>

            {!isByInvite && state.currentUserIsModerator && getPasswordManagementButton()}
          </div>
          {state.currentUserIsModerator && (
            <>
              <div className="settings-dialog__group">
                <SettingsButton
                  data-testid="author"
                  className="board-settings__show-author-button"
                  label={t("BoardSettings.ShowAuthorOption")}
                  onClick={() => {
                    store.dispatch(Actions.editBoard({showAuthors: !state.board.showAuthors}));
                  }}
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
                  onClick={() => store.dispatch(Actions.editBoard({showNotesOfOtherUsers: !state.board.showNotesOfOtherUsers}))}
                >
                  <div className="board-settings__show-notes-value">
                    <Toggle active={state.board.showNotesOfOtherUsers} />
                  </div>
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="columns"
                  className="board-settings__show-columns-button"
                  label={t("BoardSettings.ShowHiddenColumnsOption")}
                  onClick={() => store.dispatch(Actions.setShowHiddenColumns(!state.me?.showHiddenColumns))}
                >
                  <div className="board-settings__show-columns-value">
                    <Toggle active={state.me?.showHiddenColumns ?? false} />
                  </div>
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="note-repositioning"
                  className="board-settings__allow-note-repositioning-button"
                  label={t("BoardSettings.AllowNoteRepositioningOption")}
                  onClick={() => store.dispatch(Actions.editBoard({allowStacking: !state.board.allowStacking}))}
                >
                  <div className="board-settings__allow-note-repositioning-value">
                    <Toggle active={state.board.allowStacking} />
                  </div>
                </SettingsButton>
              </div>

              <SettingsButton className={classNames("board-settings__delete-button")} label={t("BoardSettings.DeleteBoard")} onClick={() => setShowConfirmationDialog(true)}>
                <div className="board-settings__delete-value">
                  <DeleteIcon />
                </div>
              </SettingsButton>
            </>
          )}

          {showConfirmationDialog && (
            <ConfirmationDialog
              title={t("ConfirmationDialog.deleteBoard")}
              onAccept={() => store.dispatch(Actions.deleteBoard())}
              onDecline={() => setShowConfirmationDialog(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
