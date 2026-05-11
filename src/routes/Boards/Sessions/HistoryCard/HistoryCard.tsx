import {HistoryBoard} from "routes/Boards/Sessions";
import {FavouriteButton} from "components/Templates";
import classNames from "classnames";
import {CalendarIcon, ColumnsIcon, KeyWithLockIcon, MultipleUserIcon, NextIcon, NoteIcon, OpenIcon, ThreeDotsIcon as MenuIcon} from "components/Icon";
import {TextArea} from "components/TextArea/TextArea";
import {Button} from "components/Button";
import {UserRoleChip} from "routes/Boards/Sessions/HistoryCard/AccessPolicyChip/UserRoleChip";
import {AccessPolicy} from "store/features";
import {ReactElement} from "react";
import "./HistoryCard.scss";

type HistoryCardProps = {
  board: HistoryBoard;
  favourite: boolean;
};

const accessPolicyIconMap: Record<AccessPolicy, ReactElement> = {
  PUBLIC: <OpenIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--public")} />,
  BY_PASSPHRASE: <KeyWithLockIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--passphrase")} />,
  BY_INVITE: <MultipleUserIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--private")} />,
};

export const HistoryCard = (props: HistoryCardProps) => {
  const renderAccessPolicyIcon = (accessPolicy: AccessPolicy) => accessPolicyIconMap[accessPolicy];

  return (
    <div className="history-card">
      <FavouriteButton
        className="history-card__favourite"
        active={props.favourite}
        onClick={() => {
          throw new Error("Not implemented yet");
        }}
      />

      <div className={classNames("history-card__head")}>
        <div className="history-card__title">{props.board.name}</div>

        {renderAccessPolicyIcon(props.board.accessPolicy)}

        <UserRoleChip className="history-card__user-role-chip" userRole={props.board.userRole} />
      </div>

      <MenuIcon className={classNames("history-card__menu", "history-card__icon", "history-card__icon--menu")} />

      <TextArea className={classNames("history-card__description")} input={props.board.description} setInput={() => {}} readOnly border="none" embedded />

      <ColumnsIcon className={classNames("history-card__icon", "history-card__icon--columns")} />

      <div className={classNames("history-card__info-footer")}>
        <div className="history-card__info-item-data-container history-card__info-item-data-container--columns">
          <div className="history-card__info-item-data-title">Columns: {props.board.columns.length}</div>
          <div className="history-card__info-item-data-subtitle">{props.board.columns.join(", ")}</div>
        </div>

        <div className="history-card__info-item">
          <CalendarIcon className={classNames("history-card__icon", "history-card__icon--calendar")} />
          <div className="history-card__info-item-data-container history-card__info-item-data-container--timestamps">
            <div className="history-card__info-item-data-title">
              {props.board.createdAt.toLocaleDateString(undefined, {weekday: "long", year: "numeric", month: "2-digit", day: "2-digit"})}
            </div>
            <div className="history-card__info-item-data-subtitle">Last Changed: {props.board.modifiedAt.toLocaleDateString()}</div>
          </div>
        </div>

        <div className="history-card__info-item">
          <MultipleUserIcon className={classNames("history-card__icon", "history-card__icon--participants")} />
          <div className="history-card__info-item-data-container history-card__info-item-data-container--participants">
            <div className="history-card__info-item-data-title">{props.board.participants} Participants</div>
          </div>
        </div>

        <div className="history-card__info-item">
          <NoteIcon className={classNames("history-card__icon", "history-card__icon--notes")} />
          <div className="history-card__info-item-data-container history-card__info-item-data-container--notes">
            <div className="history-card__info-item-data-title">{props.board.participants} Notes</div>
          </div>
        </div>
      </div>

      {props.board.isLocked && <KeyWithLockIcon className={classNames("history-card__icon", "history-card__icon--locked")} />}

      <Button
        className={classNames("history-card__button", "history-card__button--start")}
        small
        icon={<NextIcon />}
        onClick={() => {
          throw new Error("Not implemented yet");
        }}
      >
        Go to Session
      </Button>
    </div>
  );
};
