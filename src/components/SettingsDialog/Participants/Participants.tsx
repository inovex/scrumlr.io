import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Avatar} from "components/Avatar";
import {useTranslation} from "react-i18next";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsToggle} from "../Components/SettingsToggle";
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
        <div className="participants__search-and-filter">{t("ParticipantsList.searchAndFilter")}</div>
        <div className="participants__user-list-wrapper">
          <div className="participants__user-list">
            <SettingsButton className="participants__user" disabled onClick={() => store.dispatch(Actions.changePermission(state.me.user.id, state.me.role === "PARTICIPANT"))}>
              <div className="participants__user_avatar-name-wrapper">
                <Avatar className="participants__user_avatar" seed={state.me.user.id} />
                <span className="participants__user-name">
                  {state.me.user.name} {state.me.role === "OWNER" && `(${t("Participants.Owner")})`}
                </span>
                <div className={state.me.connected ? "participants__online-mark" : "participants__offline-mark"} />
              </div>
              <SettingsToggle active={state.me.role === "MODERATOR"} />
            </SettingsButton>
            {state.others.length > 0 && <hr className="settings-dialog__seperator" />}
            {state.others.length > 0 &&
              state.others.map((participant, index) => (
                <>
                  <SettingsButton
                    className="participants__user"
                    disabled={participant.role === "OWNER" || state.me.role !== "MODERATOR"}
                    onClick={() => store.dispatch(Actions.changePermission(participant.user.id, participant.role === "PARTICIPANT"))}
                  >
                    <div className="participants__user_avatar-name-wrapper">
                      <Avatar className="participants__user_avatar" seed={participant.user.id} />
                      <span className="participants__user-name">
                        {participant.user.name} {participant.role === "OWNER" && `(${t("Participants.Owner")})`}
                      </span>
                      <div className={participant.connected ? "participants__online-mark" : "participants__offline-mark"} />
                    </div>
                    <SettingsToggle active={participant.role === "MODERATOR"} />
                  </SettingsButton>
                  {state.others[index + 1] && <hr className="settings-dialog__seperator" />}
                </>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
