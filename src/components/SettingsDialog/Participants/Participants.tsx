import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Toggle} from "components/Toggle";
import {Avatar} from "components/Avatar";
import {useTranslation} from "react-i18next";
import {Fragment} from "react";
import {SettingsButton} from "../Components/SettingsButton";
import "./Participants.scss";
import "../SettingsDialog.scss";

export const Participants = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState) => ({
    me: applicationState.participants!.self,
    others: applicationState.participants!.others,
  }));

  return (
    <div className={classNames("settings-dialog__container", "accent-color__poker-purple")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.Participants")}</h2>
      </header>

      <div className="participants__container">
        <div className="participants__user-list-wrapper">
          <div className="participants__user-list">
            <SettingsButton className="participants__user" disabled>
              <div className="participants__user_avatar-name-wrapper">
                <Avatar className="participants__user_avatar" avatar={state.me.user.avatar} seed={state.me.user.id} />
                <span className="participants__user-name">
                  {state.me.user.name} {state.me.role === "OWNER" && `(${t("Participants.Owner")})`}
                </span>
                <div className={state.me.connected ? "participants__online-mark" : "participants__offline-mark"} />
              </div>
              {(state.me.role === "MODERATOR" || state.me.role === "OWNER") && <Toggle active={state.me.role === "MODERATOR" || state.me.role === "OWNER"} disabled />}
            </SettingsButton>
            {state.others.length > 0 && <hr className="settings-dialog__separator" />}
            {state.others.length > 0 &&
              state.others.map((participant, index) => (
                <Fragment key={participant.user.id}>
                  <SettingsButton
                    className="participants__user"
                    disabled={state.me.role === "PARTICIPANT" || participant.role === "OWNER"}
                    onClick={() => store.dispatch(Actions.changePermission(participant.user.id, participant.role === "PARTICIPANT"))}
                  >
                    <div className="participants__user_avatar-name-wrapper">
                      <Avatar className="participants__user_avatar" avatar={participant.user.avatar} seed={participant.user.id} />
                      <span className="participants__user-name">
                        {participant.role === "OWNER" && `(${t("Participants.Owner")})`} {participant.user.name}
                      </span>
                      <div className={participant.connected ? "participants__online-mark" : "participants__offline-mark"} />
                    </div>
                    {(state.me.role === "MODERATOR" || state.me.role === "OWNER") && (
                      <Toggle active={participant.role === "MODERATOR" || participant.role === "OWNER"} disabled={participant.role === "OWNER"} />
                    )}
                  </SettingsButton>
                  {state.others[index + 1] && <hr className="settings-dialog__separator" />}
                </Fragment>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
