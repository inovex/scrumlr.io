import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {Actions} from "store/action";
import store, {useAppSelector} from "store";
import {ReactComponent as SetPolicyIcon} from "assets/icon-lock.svg";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as RefreshIcon} from "assets/icon-refresh.svg";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import {DEFAULT_BOARD_NAME, MIN_PASSWORD_LENGTH, PLACEHOLDER_PASSWORD} from "constants/misc";
import {Toast} from "utils/Toast";
import {generateRandomString} from "utils/random";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsToggle} from "../Components/SettingsToggle";
import "./BoardSettings.scss";
import "../SettingsDialog.scss";

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
  const [isProtectedOnOpen, setIsProtectedOnOpen] = useState(state.board.accessPolicy === "BY_PASSPHRASE");
  const [isProtected, setIsProtected] = useState(state.board.accessPolicy === "BY_PASSPHRASE");
  const [activeEditMode, setActiveEditMode] = useState(false);

  const boardInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSetPassword = (newPassword: string) => {
    if (newPassword.length >= MIN_PASSWORD_LENGTH) {
      if (!isProtected || activeEditMode) {
        store.dispatch(Actions.editBoard({accessPolicy: "BY_PASSPHRASE", passphrase: newPassword}));
        navigator.clipboard.writeText(newPassword).then(() =>
          Toast.success(
            <div>
              <div>{t("Toast.passwordCopied")}</div>
            </div>,
            1500
          )
        );
        if (activeEditMode) {
          setIsProtectedOnOpen(false);
          setActiveEditMode(false);
        }
        if (!isProtected) {
          setIsProtected(true);
        }
      }
    } else if (isProtected || isProtectedOnOpen) {
      if (!activeEditMode) {
        store.dispatch(Actions.editBoard({accessPolicy: "PUBLIC"}));
        setIsProtectedOnOpen(false);
        setIsProtected(false);
        Toast.info(
          <div>
            <div>{t("Toast.boardMadePublic")}</div>
          </div>
        );
      } else {
        setActiveEditMode(false);
        if (passwordInputRef.current) passwordInputRef.current.placeholder = PLACEHOLDER_PASSWORD;
      }
    }
  };

  useEffect(() => {
    if (activeEditMode) {
      passwordInputRef.current?.focus();
      passwordInputRef.current?.select();
    }
  }, [activeEditMode]);

  const getPasswordManagementButton = () => {
    if (!activeEditMode) {
      if (isProtected) {
        return (
          <button
            className="board-settings__password-management-button board-settings__remove-protection-button button--centered"
            onClick={() => {
              setPassword("");
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
              setPassword(pw);
              handleSetPassword(pw);
            }}
          >
            <RefreshIcon />
            <span className="board-settings__password-management-text">{t("BoardSettings.generatePassword")}</span>
          </button>
        );
      }
    }
    return (
      <span className="board-settings__password-management-button board-settings__password-input-hint board-settings__password-management-text">
        {t("BoardSettings.SecurePasswordHint")}
      </span>
    );
  };

  const getPasswordVisibilityButton = () =>
    showPassword ? (
      <VisibleIcon className="board-settings__show-password-button--enabled" onClick={() => setShowPassword(false)} />
    ) : (
      <HiddenIcon
        className={!isProtectedOnOpen || activeEditMode ? "board-settings__show-password-button--enabled" : "board-settings__show-password-button--disabled"}
        onClick={() => !isProtectedOnOpen && setShowPassword(true)}
      />
    );

  const submitPasswordButton = (
    <CheckIcon
      className="board-settings__edit-password-button"
      onClick={() => {
        setActiveEditMode(false);
        handleSetPassword(passwordInputRef.current?.value ?? password ?? "");
      }}
    />
  );

  const getPasswordStatusButton = () =>
    activeEditMode ? (
      submitPasswordButton
    ) : (
      <EditIcon
        className="board-settings__edit-password-button"
        onClick={() => {
          setActiveEditMode(true);
        }}
      />
    );

  return (
    <div className={classNames("settings-dialog__container", "accent-color__backlog-blue")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.BoardSettings")}</h2>
      </header>
      <div className="board-settings__container-wrapper">
        <div className="board-settings__container">
          <SettingsButton
            className="board-settings__board-name-button"
            label={t("BoardSettings.BoardName")}
            disabled={!state.currentUserIsModerator}
            onClick={() => boardInputRef.current?.focus()}
          >
            <input
              ref={boardInputRef}
              className="board-settings__board-name-button_input"
              value={boardName}
              placeholder={DEFAULT_BOARD_NAME}
              autoComplete="off"
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && boardName && store.dispatch(Actions.editBoard({name: boardName}))}
              onBlur={(e) => {
                e.target.placeholder = DEFAULT_BOARD_NAME;
                store.dispatch(Actions.editBoard({name: boardName}));
              }}
              onFocus={(e) => {
                e.target.placeholder = "";
                if (boardName) {
                  e.target.select();
                }
              }}
              disabled={!state.currentUserIsModerator}
            />
          </SettingsButton>

          <div className="board-settings__group-and-button">
            <div className="settings-dialog__group">
              <SettingsButton className="board-settings__policy-button" label={t("BoardSettings.AccessPolicy")} disabled>
                <div className="board-settings__policy-button_value">
                  {!isProtected ? (
                    <span>{t("AccessPolicySelection.publicTitle")}</span>
                  ) : (
                    <>
                      <span>{t("AccessPolicySelection.byPassphraseTitle")}</span>
                      <SetPolicyIcon />
                    </>
                  )}
                </div>
              </SettingsButton>

              {state.currentUserIsModerator && (
                <>
                  <hr className="settings-dialog__separator" />
                  <SettingsButton
                    id="password-input-section"
                    className="board-settings__password-button"
                    label={t("BoardSettings.Password")}
                    onClick={() => passwordInputRef.current?.focus()}
                  >
                    <div className="board-settings__password-button_value">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        className="board-settings__password-button_value-input"
                        value={password}
                        readOnly={isProtected && !activeEditMode}
                        disabled={isProtectedOnOpen && !activeEditMode}
                        placeholder={!isProtected || (isProtected && activeEditMode) ? "" : PLACEHOLDER_PASSWORD}
                        autoComplete="off"
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSetPassword(passwordInputRef.current?.value ?? password ?? "")}
                        onBlur={(e) => {
                          if (e.relatedTarget?.id !== "password-input-section") {
                            handleSetPassword(passwordInputRef.current?.value ?? password ?? "");
                          }
                        }}
                      />
                      {!isProtected && !activeEditMode && password !== "" && submitPasswordButton}
                      {isProtected && getPasswordVisibilityButton()}
                      {isProtected && getPasswordStatusButton()}
                    </div>
                  </SettingsButton>
                </>
              )}
            </div>

            {state.currentUserIsModerator && getPasswordManagementButton()}
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
                  <SettingsToggle active={state.board.showAuthors} />
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="notes"
                  className="board-settings__show-notes-button"
                  label={t("BoardSettings.ShowOtherUsersNotesOption")}
                  onClick={() => store.dispatch(Actions.editBoard({showNotesOfOtherUsers: !state.board.showNotesOfOtherUsers}))}
                >
                  <SettingsToggle active={state.board.showNotesOfOtherUsers} />
                </SettingsButton>
                <hr className="settings-dialog__separator" />
                <SettingsButton
                  data-testid="columns"
                  className="board-settings__show-columns-button"
                  label={t("BoardSettings.ShowHiddenColumnsOption")}
                  onClick={() => store.dispatch(Actions.setShowHiddenColumns(!state.me?.showHiddenColumns))}
                >
                  <SettingsToggle active={state.me?.showHiddenColumns} />
                </SettingsButton>
              </div>

              <SettingsButton className={classNames("board-settings__delete-button")} label={t("BoardSettings.DeleteBoard")} onClick={() => setShowConfirmationDialog(true)}>
                <DeleteIcon />
              </SettingsButton>
            </>
          )}

          {showConfirmationDialog && (
            <ConfirmationDialog
              headline={t("ConfirmationDialog.deleteBoard")}
              acceptMessage={t("ConfirmationDialog.yes")}
              onAccept={() => store.dispatch(Actions.deleteBoard())}
              declineMessage={t("ConfirmationDialog.no")}
              onDecline={() => setShowConfirmationDialog(false)}
              className="board-settings__confirmation-dialog"
            />
          )}
        </div>
      </div>
    </div>
  );
};
