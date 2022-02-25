import classNames from "classnames";
import Parse from "parse";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {ApplicationState} from "types/store";
import {Avatar} from "components/Avatar";
import {useTranslation} from "react-i18next";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsToggle} from "../Components/SettingsToggle";
import "./Participants.scss";
import "../SettingsDialog.scss";

export const Participants = () => {
  const {t} = useTranslation();

  const state = useAppSelector((applicationState: ApplicationState) => ({
    participants: applicationState.users.all,
    board: applicationState.board.data!,
    boardOwner: applicationState.board.data!.owner,
    currentUserIsModerator: applicationState.users.admins.find((user) => user.id === Parse.User.current()!.id) !== undefined,
  }));

  const currentUser = Parse.User.current();

  const me = state.participants.find((participant) => participant.id === currentUser!.id);
  const them = state.participants.filter((participant) => participant.id !== currentUser!.id);

  // for (let i = 0; i < 30; i++) {
  //   them.push(me!);
  // }
  return (
    <div className={classNames("settings-dialog__container", "accent-color__poker-purple")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.Participants")}</h2>
      </header>

      <div className="participants__container">
        <div className="participants__search-and-filter">{t("ParticipantsList.searchAndFilter")}</div>
        <div className="participants__user-list-wrapper">
          <div className="participants__user-list">
            <SettingsButton className="participants__user" disabled onClick={() => store.dispatch(ActionFactory.changePermission(me!.id, !me!.admin))}>
              <div className="participants__user_avatar-name-wrapper">
                <Avatar className="participants__user_avatar" seed={me!.id} />
                <span className="participants__user-name">
                  {me!.displayName} {me!.id === state.boardOwner && `(${t("Participants.Owner")})`}
                </span>
                <div className={me!.online ? "participants__online-mark" : "participants__offline-mark"} />
              </div>
              <SettingsToggle active={me!.admin} />
            </SettingsButton>
            {them.length > 0 && <hr className="settings-dialog__seperator" />}
            {them.length > 0 &&
              them.map((participant, index) => (
                <>
                  <SettingsButton
                    className="participants__user"
                    disabled={participant!.id === state.boardOwner || !me!.admin}
                    onClick={() => store.dispatch(ActionFactory.changePermission(participant?.id, !participant.admin))}
                  >
                    <div className="participants__user_avatar-name-wrapper">
                      <Avatar className="participants__user_avatar" seed={participant.id} />
                      <span className="participants__user-name">
                        {participant?.displayName} {participant!.id === state.boardOwner && `(${t("Participants.Owner")})`}
                      </span>
                      <div className={participant?.online ? "participants__online-mark" : "participants__offline-mark"} />
                    </div>
                    <SettingsToggle active={participant.admin} />
                  </SettingsButton>
                  {them[index + 1] && <hr className="settings-dialog__seperator" />}
                </>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
