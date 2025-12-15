import {useState} from "react";
import {useTranslation} from "react-i18next";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {useAppDispatch, useAppSelector} from "store";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsButton} from "./SettingsButton";
import "./userDeletion.scss";
import {on} from "events";

export interface UserDeletionProps {
  id?: string;
}

export const UserDeletion = (props: UserDeletionProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [deleteAccountCheck, setDeleteAccountCheck] = useState(false);

  const onDeleteAccount = (id?: string) => {
    // Dispatch user deletion action here
    if (deleteAccountCheck) {
      console.log("User account deletion initiated for ID:", id);
      setShowDialog(false);
      setDeleteAccountCheck(false); // Reset checkbox after successful deletion
      return;
    }
    console.log("checkbox need to be checked before account deletion");
  };

  const onCancel = () => {
    setShowDialog(false);
    setDeleteAccountCheck(false); // Reset checkbox when canceling
  };

  return (
    <>
      <section>
        <SettingsButton
          icon={DeleteIcon}
          aria-checked={hotkeyNotificationsEnabled}
          label={t("ProfileSettings.deleteAccount")}
          onClick={() => setShowDialog(true)}
          role="switch"
          reverseOrder
          className="user-deletion-button"
        />
      </section>
      {showDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.deleteAccount")}
          onAccept={() => onDeleteAccount(props.id)}
          onAcceptLabel={t("ConfirmationDialog.deleteAccountButton")}
          onDecline={onCancel}
          onDeclineLabel={t("ConfirmationDialog.cancel")}
          icon={DeleteIcon}
          text={t("ConfirmationDialog.deleteAccountText")}
          checkboxLabel={t("ConfirmationDialog.deleteAccountCheck")}
          checkboxChecked={deleteAccountCheck}
          onCheckboxChange={setDeleteAccountCheck}
        />
      )}
    </>
  );
};
