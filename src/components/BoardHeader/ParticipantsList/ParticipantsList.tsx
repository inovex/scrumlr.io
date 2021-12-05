import {Portal} from "components/Portal";
import {useState} from "react";
import {UserClientModel} from "types/user";
import "./ParticipantsList.scss";
import {useAppSelector} from "store";
import Parse from "parse";
import {ReactComponent as SearchIcon} from "assets/icon-search.svg";
import {useTranslation} from "react-i18next";
import {Participant} from "./Participant";

type ParticipantsListProps = {
  open: boolean;
  onClose: () => void;
  participants: Array<UserClientModel>;
  currentUserIsModerator: boolean;
};

export var ParticipantsList = (props: ParticipantsListProps) => {
  const {t} = useTranslation();

  const [searchString, setSearchString] = useState("");
  const boardOwner = useAppSelector((state) => state.board.data?.owner);

  const currentUser = Parse.User.current();
  const me = props.participants.find((participant) => participant.id === currentUser!.id);
  const them = props.participants.filter((participant) => participant.id !== currentUser!.id && participant.online);

  if (!props.open) {
    return null;
  }

  const showMe = searchString.split(" ").every((substr) => me!.displayName.toLowerCase().includes(substr));

  return (
    <Portal
      onClose={() => {
        props.onClose();
        setSearchString("");
      }}
      darkBackground={false}
    >
      <aside className="participants">
        <div className="participants__header">
          <div className="participants__header-title">
            <h4 className="participants__header-text">
              <span>{t("ParticipantsList.title")}</span>
              <span className="participants__header-number">{props.participants.length} </span>
            </h4>
          </div>
          <SearchIcon className="header__icon" />
          <input className="participants__header-input" placeholder={t("ParticipantsList.search")} onChange={(event) => setSearchString(event.target.value.trim().toLowerCase())} />
        </div>
        <ul className="participants__list">
          <div className="list__header">
            <label>{t("ParticipantsList.headerLegendName")}</label>
            {props.currentUserIsModerator && <label>{t("ParticipantsList.headerLegendAdmin")}</label>}
          </div>
          {showMe && <Participant key={me!.id} participant={me!} currentUserIsModerator={props.currentUserIsModerator} boardOwner={boardOwner!} />}
          {them.length > 0 &&
            them
              .sort((parA, parB) => parA.displayName.localeCompare(parB.displayName)) // Sort participants by name
              .filter((participant) => searchString.split(" ").every((substr) => participant.displayName.toLowerCase().includes(substr)))
              .map((participant) => <Participant key={participant.id} participant={participant} currentUserIsModerator={props.currentUserIsModerator} boardOwner={boardOwner!} />)}
        </ul>
      </aside>
    </Portal>
  );
};
