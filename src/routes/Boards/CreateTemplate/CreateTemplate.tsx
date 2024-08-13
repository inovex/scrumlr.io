import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Dropdown} from "components/Dropdown/Dropdown";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./CreateTemplate.scss";

type DropdownOption = "open" | "password" | "approval";

export const CreateTemplate = () => {
  const {t} = useTranslation();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<DropdownOption>("open");

  const toggleDropDown = () => setOpenDropdown((curr) => !curr);
  const selectDropdownOption = (key: string) => {
    setActiveOptionKey(key);
    setOpenDropdown(false);
  };

  return (
    <div className="create-template">
      <Dropdown<DropdownOption>
        open={openDropdown}
        options={[
          {key: "open", label: t("CreateBoard.dropdown.open"), icon: <GlobeIcon />},
          {key: "password", label: t("CreateBoard.dropdown.password"), icon: <KeyIcon />},
          {key: "approval", label: t("CreateBoard.dropdown.approval"), icon: <LockIcon />},
        ]}
        activeKey={activeOptionKey}
        onToggleMenu={toggleDropDown}
        onSelect={selectDropdownOption}
      />
    </div>
  );
};
