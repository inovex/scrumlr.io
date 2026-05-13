import {HistoryBoard} from "routes/Boards/Sessions";
import {FavouriteButton} from "components/Templates";
import classNames from "classnames";
import {
  CalendarIcon,
  CloseIcon,
  ColumnsIcon,
  Duplicate2Icon,
  EditIcon,
  KeyProtectedIcon,
  KeyWithLockIcon,
  LinkIcon,
  LockClosedIcon,
  MultipleUserIcon,
  NextIcon,
  NoteIcon,
  OpenIcon,
  ThreeDotsIcon as MenuIcon,
  TrashIcon,
} from "components/Icon";
import {TextArea} from "components/TextArea/TextArea";
import {Button} from "components/Button";
import {UserRoleChip} from "routes/Boards/Sessions/HistoryCard/AccessPolicyChip/UserRoleChip";
import {AccessPolicy} from "store/features";
import {ReactElement, useState} from "react";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import {Tooltip} from "components/Tooltip";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import {useTranslation} from "react-i18next";
import "./HistoryCard.scss";

type HistoryCardProps = {
  board: HistoryBoard;
};

const accessPolicyIconMap: Record<AccessPolicy, ReactElement> = {
  PUBLIC: <OpenIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--public")} />,
  BY_PASSPHRASE: <LockClosedIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--passphrase")} />,
  BY_INVITE: <KeyProtectedIcon className={classNames("history-card__access-policy", "history-card__icon", "history-card__icon--private")} />,
};

export const HistoryCard = (props: HistoryCardProps) => {
  const {t} = useTranslation();

  const [showMiniMenu, setShowMiniMenu] = useState(false);

  const joinedColumnsNames = props.board.columns.join(", ");
  const {isTextTruncated: isColumnsSubtitleTruncated, textRef: columnsSubtitleRef} = useTextOverflow<HTMLDivElement>(joinedColumnsNames);
  const {isTextTruncated: isBoardNameTruncated, textRef: boardNameRef} = useTextOverflow<HTMLDivElement>(props.board.name);

  const renderAccessPolicyIcon = (accessPolicy: AccessPolicy) => accessPolicyIconMap[accessPolicy];

  const renderMenu = () =>
    showMiniMenu ? (
      <MiniMenu
        className={classNames("history-card__menu", "history-card__menu--open")}
        items={[
          {
            label: t("History.HistoryCard.Menu.delete"),
            element: <TrashIcon />,
            onClick: () => {
              throw new Error("Not implemented yet");
            },
          },
          {
            label: t("History.HistoryCard.Menu.copyLink"),
            element: <LinkIcon />,
            onClick: () => {
              throw new Error("Not implemented yet");
            },
          },
          {
            label: t("History.HistoryCard.Menu.createTemplate"),
            element: <Duplicate2Icon />,
            onClick: () => {
              throw new Error("Not implemented yet");
            },
          },
          {
            label: t("History.HistoryCard.Menu.edit"),
            element: <EditIcon />,
            onClick: () => {
              throw new Error("Not implemented yet");
            },
          },
          {label: t("History.HistoryCard.Menu.close"), element: <CloseIcon />, onClick: () => setShowMiniMenu(false)},
        ]}
        focusBehaviour="moveFocus"
        onBlur={() => setShowMiniMenu(false)}
        dataCy="template-card__menu"
      />
    ) : (
      <div className="history-card__menu-icon-container">
        <MenuIcon className={classNames("history-card__icon", "history-card__icon--menu")} onClick={() => setShowMiniMenu(true)} />
      </div>
    );

  return (
    <div className="history-card__wrapper">
      <div className="history-card">
        <FavouriteButton
          className="history-card__favourite"
          active={props.board.favourite}
          onClick={() => {
            throw new Error("Not implemented yet");
          }}
        />

        <div className={classNames("history-card__head")}>
          <div ref={boardNameRef} id={`history-card__title::${props.board.id}`} className="history-card__title">
            {props.board.name}
          </div>

          {renderAccessPolicyIcon(props.board.accessPolicy)}

          <UserRoleChip className="history-card__user-role-chip" userRole={props.board.userRole} />
        </div>

        {renderMenu()}

        <TextArea className={classNames("history-card__description")} input={props.board.description} rows={3} setInput={() => {}} readOnly border="none" embedded />

        <div className={classNames("history-card__info-footer")}>
          <div className="history-card__info-item">
            <ColumnsIcon className={classNames("history-card__icon", "history-card__icon--columns")} />
            <div className="history-card__info-item-data-container history-card__info-item-data-container--columns">
              <div className="history-card__info-item-data-title">{t("History.HistoryCard.Info.amountColumns", {count: props.board.columns.length})}</div>
              <div ref={columnsSubtitleRef} id={`history-card__info-item-data-subtitle--columns::${props.board.id}`} className="history-card__info-item-data-subtitle">
                {joinedColumnsNames}
              </div>
            </div>
          </div>

          <div className="history-card__info-item">
            <CalendarIcon className={classNames("history-card__icon", "history-card__icon--calendar")} />
            <div className="history-card__info-item-data-container history-card__info-item-data-container--timestamps">
              <div className="history-card__info-item-data-title">
                {props.board.createdAt.toLocaleDateString(undefined, {weekday: "long", year: "numeric", month: "2-digit", day: "2-digit"})}
              </div>
              <div className="history-card__info-item-data-subtitle">
                {t("History.HistoryCard.Info.lastUpdated", {date: props.board.modifiedAt.toLocaleDateString(), interpolation: {escapeValue: false}})}
              </div>
            </div>
          </div>

          <div className="history-card__info-item">
            <MultipleUserIcon className={classNames("history-card__icon", "history-card__icon--participants")} />
            <div className="history-card__info-item-data-container history-card__info-item-data-container--participants">
              <div className="history-card__info-item-data-title">{t("History.HistoryCard.Info.amountParticipants", {count: props.board.participants})}</div>
            </div>
          </div>

          <div className="history-card__info-item">
            <NoteIcon className={classNames("history-card__icon", "history-card__icon--notes")} />
            <div className="history-card__info-item-data-container history-card__info-item-data-container--notes">
              <div className="history-card__info-item-data-title">{t("History.HistoryCard.Info.amountNotes", {count: props.board.notes})}</div>
            </div>
          </div>
        </div>

        <div className={classNames("history-card__locked-icon-container", {"history-card__locked-icon-container--is-locked": props.board.isLocked})}>
          <KeyWithLockIcon id={`history-card__icon--locked::${props.board.id}`} className={classNames("history-card__icon", "history-card__icon--locked")} />
        </div>

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
        {isBoardNameTruncated.horizontal && (
          <Tooltip anchorId={`history-card__title::${props.board.id}`} color="backlog-blue">
            {props.board.name}
          </Tooltip>
        )}
        <Tooltip anchorId={`history-card__icon--locked::${props.board.id}`} color="backlog-blue">
          {t("History.HistoryCard.readOnly")}
        </Tooltip>
        {isColumnsSubtitleTruncated.horizontal && (
          <Tooltip anchorId={`history-card__info-item-data-subtitle--columns::${props.board.id}`} color="backlog-blue">
            {joinedColumnsNames}
          </Tooltip>
        )}
      </div>
    </div>
  );
};
