import {HistoryBoard} from "routes/Boards/Sessions";
import {FavouriteButton} from "components/Templates";
import classNames from "classnames";
import {CalendarIcon, ColumnsIcon, KeyWithLockIcon, MultipleUserIcon, NextIcon, NoteIcon, OpenIcon, ThreeDotsIcon as MenuIcon} from "components/Icon";
import {TextArea} from "components/TextArea/TextArea";
import {Button} from "components/Button";
import "./HistoryCard.scss";

type HistoryCardProps = {
  board: HistoryBoard;
  favourite: boolean;
};

export const HistoryCard = (props: HistoryCardProps) => (
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

        <OpenIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--public")} />

        <div className="history-card__user-role-chip">{props.board.userRole}</div>

        <MenuIcon className={classNames("history-card__menu", "history-card__icon", "history-card__icon--menu")} />
      </div>

      <TextArea className={classNames("history-card__description")} input={props.board.description} setInput={() => {}} readOnly border="none" embedded />

      <ColumnsIcon className={classNames("history-card__icon", "history-card__icon--columns")} />

      <div className={classNames("history-card__info-footer")}>
        <div className="history-card__columns">
          <div className="history-card__columns-title">Columns: {props.board.columns.length}</div>
          <div className="history-card__columns-subtitle">{props.board.columns.join(", ")}</div>
        </div>

        <div className="history-card__info-item">
          <CalendarIcon className={classNames("history-card__icon", "history-card__icon--calendar")} />
          <div className="history-card__timestamps">
            <div className="history-card__timestamps-title">
              {props.board.createdAt.toLocaleDateString(undefined, {weekday: "long", year: "numeric", month: "2-digit", day: "2-digit"})}
            </div>
            <div className="history-card__timestamps-subtitle">Last Changed: {props.board.modifiedAt.toLocaleDateString()}</div>
          </div>
        </div>

        <div className="history-card__info-item">
          <MultipleUserIcon className={classNames("history-card__icon", "history-card__icon--participants")} />
          <div className="history-card__participants">
            <div className="history-card__participants-title">{props.board.participants} Participants</div>
          </div>
        </div>

        <div className="history-card__info-item">
          <NoteIcon className={classNames("history-card__icon", "history-card__icon--notes")} />
          <div className="history-card__notes">
            <div className="history-card__notes-title">{props.board.participants} Notes</div>
          </div>
        </div>
      </div>

      <KeyWithLockIcon className={classNames("history-card__icon", "history-card__icon--locked")} />

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
