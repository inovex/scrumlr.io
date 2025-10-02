import classNames from "classnames";
import {UserAvatar} from "components/BoardUsers";
import {AvataaarProps} from "avataaars";
import "./DragIndicatorPill.scss";

type DragIndicatorPillProps = {
  userId: string;
  userName: string;
  userAvatar?: AvataaarProps;
  message: string;
  className?: string;
};

export const DragIndicatorPill = ({userId, userName, userAvatar, message, className}: DragIndicatorPillProps) => (
  <div className={classNames("drag-indicator-pill", className)}>
    <div className="drag-indicator-pill__avatar">
      <UserAvatar id={userId} avatar={userAvatar} title={userName} className="drag-indicator-pill__avatar-image" avatarClassName="drag-indicator-pill__avatar-image" />
    </div>
    <div className="drag-indicator-pill__text">{message}</div>
  </div>
);
