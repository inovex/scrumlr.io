import {Shuffle} from "components/Icon";
import classNames from "classnames";
import {FC, Fragment, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {useAppDispatch, useAppSelector} from "store";
import {SettingsButton} from "./SettingsButton";
import "./userDeletion.scss";

export interface UserDeletionProps {
  id?: string;
}

export const UserDeletion = (props: UserDeletionProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  return (
    <section>
      <SettingsButton
        icon={DeleteIcon}
        aria-checked={hotkeyNotificationsEnabled}
        label={t("ProfileSettings.deleteAccount")}
        onClick={() => console.log("User deletion clicked")}
        role="switch"
        reverseOrder
        className="user-deletion-button"
       />
    </section>
  );
};
