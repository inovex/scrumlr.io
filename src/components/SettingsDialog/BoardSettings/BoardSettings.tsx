import "./BoardSettings.scss";
import "../SettingsDialog.scss";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useRef, useState} from "react";
import Parse from "parse";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
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

export const BoardSettings = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
    userConfiguration: applicationState.board.data!.userConfigurations.find((configuration) => configuration.id === Parse.User.current()!.id)!,
    currentUserIsModerator: applicationState.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined,
  }));

  const [boardName, setBoardName] = useState<string>(state.board.name);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);

  const boardInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSetPolicy = (AccessType: string) => {
    if (AccessType === "Public") {
      store.dispatch(ActionFactory.editBoard({id: state.board.id, accessPolicy: {type: "Public"}}));
    } else {
      store.dispatch(ActionFactory.editBoard({id: state.board.id, accessPolicy: {type: "ByPassphrase", passphrase: password}}));
      setPassword("");
    }
  };

  return (
    <div className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__backlog-blue")}> {t("ExportBoardOption.title")}</h2>
      </div>

      <div className={classNames("board-settings__container", "accent-color__backlog-blue")}>
        <SettingsButton className="board-settings__board-name-button" label="Board Name" disabled={!state.currentUserIsModerator} onClick={() => boardInputRef.current?.focus()}>
          <input
            ref={boardInputRef}
            className="board-settings__board-name-button_input"
            value={boardName}
            placeholder="scrumlr.io"
            onChange={(e) => setBoardName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName}))}
            onBlur={() => store.dispatch(ActionFactory.editBoard({id: state.board!.id, name: boardName}))}
          />
        </SettingsButton>

        <div className={classNames("board-settings__group-and-button")}>
          <div className="settings-dialog__group">
            <SettingsButton className="board-settings__policy-button" label="Access Policy" disabled>
              <div className="board-settings__policy-button_value">
                <span>{state.board.accessPolicy}</span>
                <SetPolicyIcon />
              </div>
            </SettingsButton>

            {state.currentUserIsModerator && state.board.accessPolicy === "Public" && (
              <>
                <hr className="settings-dialog__seperator" />
                <div className="board-settings__password-button-wrapper">
                  <SettingsButton className="board-settings__password-button" label="Password" onClick={() => passwordInputRef.current?.focus()}>
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
                  <RefreshIcon className="board-settings__password-button-extension" onClick={() => setPassword(generateRandomString())} />
                </div>
              </>
            )}
          </div>

          {state.currentUserIsModerator &&
            (state.board.accessPolicy === "Public" ? (
              <button className="board-settings__set-policy-button" onClick={() => handleSetPolicy("ByPassphrase")}>
                <SetPolicyIcon />
                <span>Set to password protected</span>
              </button>
            ) : (
              <button className="board-settings__set-policy-button" onClick={() => handleSetPolicy("Public")}>
                <SetPolicyIcon />
                <span>Set to open</span>
              </button>
            ))}
        </div>

        {state.currentUserIsModerator && (
          <>
            <div className={classNames("settings-dialog__group")}>
              <SettingsButton
                className="board-settings__show-author-button"
                label="Show authors of cards"
                onClick={() => {
                  store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board.showAuthors}));
                }}
              >
                <SettingsToggle active={state.board.showAuthors} />
              </SettingsButton>
              <hr className="settings-dialog__seperator" />
              <SettingsButton
                className="board-settings__show-notes-button"
                label="Show notes of other users"
                onClick={() => store.dispatch(ActionFactory.editBoard({id: state.board!.id, showNotesOfOtherUsers: !state.board.showNotesOfOtherUsers}))}
              >
                <SettingsToggle active={state.board.showNotesOfOtherUsers} />
              </SettingsButton>
              <hr className="settings-dialog__seperator" />
              <SettingsButton
                className="board-settings__show-columns-button"
                label="Show colums"
                onClick={() => store.dispatch(ActionFactory.editUserConfiguration({showHiddenColumns: !state.userConfiguration.showHiddenColumns}))}
              >
                <SettingsToggle active={state.userConfiguration.showHiddenColumns} />
              </SettingsButton>
            </div>

            <SettingsButton className={classNames("board-settings__delete-button")} label="Delete Board" onClick={() => setShowConfirmationDialog(true)}>
              <DeleteIcon />
            </SettingsButton>
          </>
        )}

        {showConfirmationDialog && (
          <ConfirmationDialog
            headline={t("ConfirmationDialog.returnToHomepage")}
            acceptMessage={t("ConfirmationDialog.yes")}
            onAccept={() => store.dispatch(ActionFactory.deleteBoard(state.board!.id))}
            declineMessage={t("ConfirmationDialog.no")}
            onDecline={() => setShowConfirmationDialog(false)}
            className="board-settings__confirmation-dialog"
          />
        )}
      </div>
    </div>
  );
};
