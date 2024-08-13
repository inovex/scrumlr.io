import {useState} from "react";
import {useTranslation} from "react-i18next";
import {AccessPolicy} from "types/board";
import {Dropdown} from "components/Dropdown/Dropdown";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./CreateTemplate.scss";

export const CreateTemplate = () => {
  const {t} = useTranslation();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<AccessPolicy>(AccessPolicy.PUBLIC);

  const toggleDropDown = () => setOpenDropdown((curr) => !curr);
  const selectDropdownOption = (key: AccessPolicy) => {
    setActiveOptionKey(key);
    setOpenDropdown(false);
  };

  return (
    <div className="create-template">
      <Dropdown<AccessPolicy>
        open={openDropdown}
        options={[
          {key: AccessPolicy.PUBLIC, label: t("CreateBoard.dropdown.open"), icon: <GlobeIcon />},
          {key: AccessPolicy.BY_PASSPHRASE, label: t("CreateBoard.dropdown.password"), icon: <KeyIcon />},
          {key: AccessPolicy.BY_INVITE, label: t("CreateBoard.dropdown.approval"), icon: <LockIcon />},
        ]}
        activeKey={activeOptionKey}
        onToggleMenu={toggleDropDown}
        onSelect={selectDropdownOption}
      />
    </div>
  );
};
