import {useState} from "react";
import {useTranslation} from "react-i18next";
import {TrashIcon} from "components/Icon";
import {useAppDispatch, useAppSelector} from "store";
import {deleteAccount} from "store/features/auth/thunks";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsButton} from "./SettingsButton";
import "./UserDeletion.scss";

export interface UserDeletionProps {
  id?: string;
}

export const UserDeletion = (props: UserDeletionProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const hotkeyNotificationsEnabled = useAppSelector((state) => state.view.hotkeyNotificationsEnabled);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [deleteAccountCheck, setDeleteAccountCheck] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);

  const onDeleteAccount = (id?: string) => {
    if (deleteAccountCheck && id) {
      dispatch(deleteAccount(id));
      setShowDialog(false);
      setDeleteAccountCheck(false);
      setShowCheckboxError(false);
      return;
    }
    // Show error if checkbox not checked
    setShowCheckboxError(true);
  };

  const onCancel = () => {
    setShowDialog(false);
    setDeleteAccountCheck(false); // Reset checkbox when canceling
    setShowCheckboxError(false);
  };

  return (
    <>
      <section>
        <SettingsButton
          icon={TrashIcon}
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
          icon={TrashIcon}
          text={t("ConfirmationDialog.deleteAccountText")}
          items={t("ConfirmationDialog.deleteAccountItems")}
          textAfterItems={t("ConfirmationDialog.deleteAccountTextAfterItems")}
          checkbox={{
            label: t("ConfirmationDialog.deleteAccountCheck"),
            checked: deleteAccountCheck,
            onChange: setDeleteAccountCheck,
            showError: showCheckboxError,
          }}
        />
      )}
    </>
  );
};
