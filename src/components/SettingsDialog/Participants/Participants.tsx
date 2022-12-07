import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Toggle} from "components/Toggle";
import {Avatar} from "components/Avatar";
import {useTranslation} from "react-i18next";
import "./Participants.scss";
import "../SettingsDialog.scss";
import {Participant, ParticipantRole} from "types/participant";
import _ from "underscore";
import {useState} from "react";
import {SettingsButton} from "../Components/SettingsButton";

type ParticipantsFilter = {
  name: string;
  status: "OFFLINE" | "ONLINE" | "ALL";
  role: ParticipantRole | "ALL";
};

export const Participants = () => {
  const {t} = useTranslation();

  const [filter, setFilter] = useState<ParticipantsFilter>({name: "", status: "ALL", role: "ALL"});
  const nameFilter = (participant: Participant): boolean =>
    filter.name.length < 3 ||
    filter.name
      .toLowerCase()
      .split(" ")
      .every((substr) => participant.user.name.toLowerCase().includes(substr));
  const statusFilter = (participant: Participant): boolean =>
    filter.status === "ALL" || (filter.status === "ONLINE" && participant.connected) || (filter.status === "OFFLINE" && !participant.connected);
  const roleFilter = (participant: Participant): boolean => filter.role === "ALL" || participant.role === filter.role;
  const filterFunctions = (participant: Participant) => _.every([nameFilter(participant), statusFilter(participant), roleFilter(participant)]);

  const participants: Participant[] = useAppSelector((state) => [state.participants!.self, ...(state.participants?.others ?? [])]);
  const isModerator: boolean = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");

  const renderFilterOptions = () => (
    <div className="participants__filter-options">
      <input aria-label="Name Filter" placeholder="Name" onChange={(e) => setFilter((filter) => ({...filter, name: e.target.value}))} />
      <div>
        <select name="status" value={filter.status} onChange={(e) => setFilter((filter) => ({...filter, status: e.target.value as typeof filter.status}))}>
          <option value="ALL">All</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
        <select name="role" value={filter.role} onChange={(e) => setFilter((filter) => ({...filter, role: e.target.value as typeof filter.role}))}>
          <option value="ALL">All</option>
          <option value="PARTICIPANT">Participant</option>
          <option value="MODERATOR">Moderator</option>
          <option value="OWNER">Owner</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className={classNames("settings-dialog__container", "accent-color__poker-purple")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text"> {t("SettingsDialog.Participants")}</h2>
      </header>
      {renderFilterOptions()}
      <div className="participants__container">
        <div className="participants__user-list-wrapper">
          <div className="participants__user-list">
            {participants.filter(filterFunctions).map((participant) => (
              <SettingsButton
                className="participants__user"
                disabled={!isModerator || participant.role === "OWNER"}
                onClick={() => store.dispatch(Actions.changePermission(participant.user.id, participant.role === "PARTICIPANT"))}
              >
                <div className="participants__user_avatar-name-wrapper">
                  <Avatar className="participants__user_avatar" avatar={participant.user.avatar} seed={participant.user.id} />
                  <span className="participants__user-name">{participant.user.name}</span>
                  <div className={participant.connected ? "participants__online-mark" : "participants__offline-mark"} />
                </div>
                {isModerator && <Toggle active={participant.role === "MODERATOR" || participant.role === "OWNER"} disabled={participant.role === "OWNER"} />}
              </SettingsButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
