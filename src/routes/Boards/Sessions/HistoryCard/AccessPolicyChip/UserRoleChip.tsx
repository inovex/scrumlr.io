import {ReactElement} from "react";
import {ModeratorIcon, ParticipantIcon, OwnerIcon} from "components/Icon";
import {ParticipantRole} from "store/features";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import "./UserRoleChip.scss";

type UserRoleChipProps = {
  className: string;
  userRole: ParticipantRole;
};

const userRoleIconMap: Record<ParticipantRole, ReactElement> = {
  PARTICIPANT: <ParticipantIcon className={classNames("access-policy-chip__icon", "access-policy-chip__icon--participant")} />,
  MODERATOR: <ModeratorIcon className={classNames("access-policy-chip__icon", "access-policy-chip__icon--moderator")} />,
  OWNER: <OwnerIcon className={classNames("access-policy-chip__icon", "access-policy-chip__icon--owner")} />,
};

export const UserRoleChip = (props: UserRoleChipProps) => {
  const {t} = useTranslation();

  const userRoleTranslationKeyMap: Record<ParticipantRole, string> = {
    PARTICIPANT: "UserRole.Participant",
    MODERATOR: "UserRole.Moderator",
    OWNER: "UserRole.Owner",
  };

  const renderUserRoleIcon = (userRole: ParticipantRole) => userRoleIconMap[userRole];

  return (
    <div className={classNames("access-policy-chip", `access-policy-chip--${props.userRole.toString().toLowerCase()}`, props.className)}>
      {renderUserRoleIcon(props.userRole)}
      <div className="access-policy-chip__label">{t(userRoleTranslationKeyMap[props.userRole])}</div>
    </div>
  );
};
