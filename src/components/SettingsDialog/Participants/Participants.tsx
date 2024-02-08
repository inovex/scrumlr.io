import {useEffect, useRef, useState} from "react";
import _ from "underscore";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import classNames from "classnames";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {useDebounce} from "utils/hooks/useDebounce";
import {UserAvatar} from "components/BoardUsers";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {Participant} from "types/participant";
import {ReactComponent as WifiIconDisabled} from "assets/icon-wifi-disabled.svg";
import {ReactComponent as MagnifyingGlassIcon} from "assets/icon-magnifying-glass.svg";
import {ReactComponent as ReadyCheckIcon} from "assets/icon-check.svg";
import {ReactComponent as KickIcon} from "assets/icon-close.svg";
import {ReactComponent as RemoveParticipant} from "assets/icon-kick-participant.svg";
import "./Participants.scss";

export const Participants = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [queryString, setQueryString] = useState<string>("");
  const debouncedQueryString = useDebounce(queryString);
  const [permissionFilter, setPermissionFilter] = useState<"ALL" | "OWNER" | "MODERATOR" | "PARTICIPANT">("ALL");
  const [onlineFilter, setOnlineFilter] = useState<boolean>(true);
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);
  const listWrapperRef = useRef<HTMLDivElement>(null);
  const isModerator = useAppSelector((state) => state.participants!.self.role === "OWNER" || state.participants!.self.role === "MODERATOR");
  const self = useAppSelector((state) => state.participants!.self);
  const participants = useAppSelector((state) => [state.participants!.self, ...(state.participants?.others ?? [])], _.isEqual);
  const existsAtLeastOneReadyUser = participants.some((p) => p.ready);

  const [showBanParticipantConfirmation, setShowBanParticipantConfirmation] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant>();

  useEffect(() => {
    const listWrapperHeight = listWrapperRef.current?.offsetWidth;
    const listHeight = listRef.current?.offsetHeight;
    if (listHeight && listWrapperHeight && listHeight > listWrapperHeight) {
      setIsScrollable(true);
    } else {
      setIsScrollable(false);
    }
  }, [participants]);

  const resetReadyStateOfAllUsers = () => {
    participants.forEach((p) => dispatch(Actions.setUserReadyStatus(p.user.id, false)));
  };

  const askToBanUser = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowBanParticipantConfirmation(true);
  };

  const denyToBanUser = () => {
    setSelectedParticipant(undefined);
    setShowBanParticipantConfirmation(false);
  };

  // not asking but actually doing it
  const confirmToBanUser = ({user}: Participant) => {
    dispatch(Actions.setUserBanned(user.id, user.name, true));
  };

  return (
    <section className="settings-dialog__container accent-color__poker-purple">
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("Participants.Title")}</h2>
      </header>
      <div className="participants__search-input-wrapper">
        <input placeholder="Name..." className="participants__search-input" onChange={(e) => setQueryString(e.target.value)} />
        <MagnifyingGlassIcon className="participants__search-icon" />
      </div>
      <div className="participants__filter-buttons">
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "OWNER"})}
          onClick={() => setPermissionFilter(permissionFilter === "OWNER" ? "ALL" : "OWNER")}
          title={t("Participants.OwnerFilterTooltip")}
        >
          {t("UserRole.Owner")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "MODERATOR"})}
          onClick={() => setPermissionFilter(permissionFilter === "MODERATOR" ? "ALL" : "MODERATOR")}
          title={t("Participants.ModeratorFilterTooltip")}
        >
          {t("UserRole.Moderator")}
        </button>
        <button
          className={classNames("participants__permisson-filter-button", {"participants__permisson-filter-button--active": permissionFilter === "PARTICIPANT"})}
          onClick={() => setPermissionFilter(permissionFilter === "PARTICIPANT" ? "ALL" : "PARTICIPANT")}
          title={t("Participants.ParticipantFilterTooltip")}
        >
          {t("UserRole.Participant")}
        </button>

        <button
          aria-label={t("Participants.OnlineFilterTooltip")}
          className={classNames("participant__status-filter-button", {"participant__status-filter-button--active": !onlineFilter})}
          onClick={() => setOnlineFilter((o) => !o)}
          title={t("Participants.OnlineFilterTooltip")}
        >
          <WifiIconDisabled />
        </button>
      </div>
      <div className={classNames("participants__list-wrapper", {"participants__list-scrollable": isScrollable})} ref={listWrapperRef}>
        <ul className="participants__list" ref={listRef}>
          {participants
            .filter((participant) =>
              debouncedQueryString
                .toLowerCase()
                .split(" ")
                .every((s) => participant.user.name.toLowerCase().includes(s))
            )
            .filter((participant) => participant.role === permissionFilter || permissionFilter === "ALL")
            .filter((participant) => participant.connected === onlineFilter)
            .map((participant) => (
              <li key={participant.user.id} className="participants__list-item">
                <UserAvatar avatar={participant.user.avatar} className="participant__avatar" id={participant.user.id} ready={participant.ready} title={participant.user.name} />
                <div className="participant__name-role-wrapper">
                  <span className="participant__name">{participant.user.name}</span>
                  {participant.role === "OWNER" || !isModerator || participant.user.id === self.user.id ? (
                    <span className="participant__role">
                      {participant.role === "OWNER" && t("UserRole.Owner")}
                      {participant.role === "MODERATOR" && t("UserRole.Moderator")}
                      {participant.role === "PARTICIPANT" && t("UserRole.Participant")}
                    </span>
                  ) : (
                    <div className="participant__role-buttons">
                      <button
                        className={classNames("participant__role", {"participant__role--active": participant.role === "MODERATOR"})}
                        disabled={participant.role === "MODERATOR"}
                        onClick={() => dispatch(Actions.changePermission(participant.user.id, true))}
                        title={t("Participants.ChangeRoleToModeratorTooltip")}
                      >
                        {t("UserRole.Moderator")}
                      </button>
                      <button
                        className={classNames("participant__role", {"participant__role--active": participant.role === "PARTICIPANT"})}
                        disabled={participant.role === "PARTICIPANT"}
                        onClick={() => dispatch(Actions.changePermission(participant.user.id, false))}
                        title={t("Participants.ChangeRoleToParticipantTooltip")}
                      >
                        {t("UserRole.Participant")}
                      </button>
                    </div>
                  )}
                </div>
                {isModerator && participant.user.id !== self.user.id && ["PARTICIPANT", "MODERATOR"].includes(participant.role) && (
                  <button
                    aria-label={t("Participants.BanParticipantTooltip")}
                    title={t("Participants.BanParticipantTooltip")}
                    className="participant__kick-icon"
                    onClick={() => askToBanUser(participant)}
                  >
                    <KickIcon />
                  </button>
                )}
              </li>
            ))}
        </ul>
      </div>
      {isModerator && (
        <footer className={classNames("participants-reset-state-banner__container", {"participants-reset-state-banner__container--is-active": existsAtLeastOneReadyUser})}>
          <div className="participants-reset-state-banner__icon-and-text">
            <ReadyCheckIcon className="participants-reset-state-banner__check-icon" />
            <div className="participants-reset-state-banner__text">{t("Participants.ResetBannerText")}</div>
          </div>
          <button className="participants-reset-state-banner__button" onClick={resetReadyStateOfAllUsers}>
            {t("Participants.ResetBannerButton")}
          </button>
        </footer>
      )}

      {showBanParticipantConfirmation && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.banParticipant", {user: selectedParticipant?.user.name})}
          onAccept={() => confirmToBanUser(selectedParticipant!)} // assertion: selectedParticipant is set
          onDecline={() => denyToBanUser()}
          icon={RemoveParticipant}
          warning
        />
      )}
    </section>
  );
};
