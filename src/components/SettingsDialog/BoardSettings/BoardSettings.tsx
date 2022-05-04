import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useRef, useState} from "react";
import {Actions} from "store/action";
import store, {useAppSelector} from "store";
import {ReactComponent as SetPolicyIcon} from "assets/icon-lock.svg";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as VisableIcon} from "assets/icon-visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as RefreshIcon} from "assets/icon-refresh.svg";
import {generateRandomString} from "utils/random";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsToggle} from "../Components/SettingsToggle";
import "./BoardSettings.scss";
import "../SettingsDialog.scss";
import {DEFAULT_BOARD_NAME} from "../../../constants/misc";

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

  const boardInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSetPolicy = (AccessType: string) => {
    if (AccessType === "ByPassphrase") {
      if (password.length > 0) {
        store.dispatch(Actions.editBoard({accessPolicy: "BY_PASSPHRASE", passphrase: password}));
      } else {
        passwordInputRef.current?.focus();
      }
    } else {
      store.dispatch(Actions.editBoard({accessPolicy: "PUBLIC"}));
    }
  };

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
              onChange={(e) => setBoardName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && boardName && store.dispatch(Actions.editBoard({name: boardName}))}
              onBlur={(e) => {
                e.target.placeholder = boardName || DEFAULT_BOARD_NAME;
                store.dispatch(Actions.editBoard({name: boardName}));
              }}
              onFocus={(e) => {
                e.target.placeholder = "";
              }}
              disabled={!state.currentUserIsModerator}
            />
          </SettingsButton>

          <div className="board-settings__group-and-button">
            <div className="settings-dialog__group">
              <SettingsButton className="board-settings__policy-button" label={t("BoardSettings.AccessPolicy")} disabled>
                <div className="board-settings__policy-button_value">
                  <span>{state.board.accessPolicy === "PUBLIC" ? t("AccessPolicySelection.publicTitle") : t("AccessPolicySelection.byPassphraseTitle")}</span>
                  <SetPolicyIcon />
                </div>
              </SettingsButton>

              {state.currentUserIsModerator && state.board.accessPolicy === "PUBLIC" && (
                <>
                  <hr className="settings-dialog__seperator" />
                  <SettingsButton className="board-settings__password-button" label={t("BoardSettings.Password")} onClick={() => passwordInputRef.current?.focus()}>
                    <div className="board-settings__password-button_value">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        className="board-settings__password-button_value-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {showPassword ? <VisableIcon onClick={() => setShowPassword(!showPassword)} /> : <HiddenIcon onClick={() => setShowPassword(!showPassword)} />}
                    </div>
                  </SettingsButton>
                </>
              )}
            </div>

            {state.currentUserIsModerator &&
              (state.board.accessPolicy === "PUBLIC" ? (
                <>
                  <button className="board-settings__generate-password-button" onClick={() => setPassword(generateRandomString())}>
                    <RefreshIcon />
                    <span>{t("BoardSettings.generatePassword")}</span>
                  </button>
                  <button className="board-settings__set-policy-button" onClick={() => handleSetPolicy("ByPassphrase")}>
                    <SetPolicyIcon />
                    <span>{t("BoardSettings.SetAccessPolicyPasswordProtected")}</span>
                  </button>
                </>
              ) : (
                <button className="board-settings__set-policy-button button--centered" onClick={() => handleSetPolicy("Public")}>
                  <SetPolicyIcon />
                  <span>{t("BoardSettings.SetAccessPolicyOpen")}</span>
                </button>
              ))}
          </div>

          {state.currentUserIsModerator && (
            <>
              <div className="settings-dialog__group">
                <SettingsButton
                  data-testid="author"
                  className="board-settings__show-author-button"
                  label={state.board.showAuthors ? t("ShowAuthorOption.hide") : t("ShowAuthorOption.show")}
                  onClick={() => {
                    store.dispatch(Actions.editBoard({showAuthors: !state.board.showAuthors}));
                  }}
                >
                  <SettingsToggle active={state.board.showAuthors} />
                </SettingsButton>
                <hr className="settings-dialog__seperator" />
                <SettingsButton
                  data-testid="notes"
                  className="board-settings__show-notes-button"
                  label={state.board.showNotesOfOtherUsers ? t("ShowOtherUsersNotesOption.hide") : t("ShowOtherUsersNotesOption.show")}
                  onClick={() => store.dispatch(Actions.editBoard({showNotesOfOtherUsers: !state.board.showNotesOfOtherUsers}))}
                >
                  <SettingsToggle active={state.board.showNotesOfOtherUsers} />
                </SettingsButton>
                <hr className="settings-dialog__seperator" />
                <SettingsButton
                  data-testid="columns"
                  className="board-settings__show-columns-button"
                  label={state.me?.showHiddenColumns ? t("ShowHiddenColumnsOption.hide") : t("ShowHiddenColumnsOption.show")}
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
