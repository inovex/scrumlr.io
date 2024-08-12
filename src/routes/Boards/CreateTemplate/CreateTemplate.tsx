import {useState} from "react";
import {Dropdown} from "components/Dropdown/Dropdown";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./CreateTemplate.scss";

export const CreateTemplate = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<string>("open");

  const toggleDropDown = () => setOpenDropdown((curr) => !curr);
  const selectDropdownOption = (key: string) => {
    setActiveOptionKey(key);
    setOpenDropdown(false);
  };

  return (
    <div className="create-template">
      <Dropdown
        open={openDropdown}
        options={[
          {key: "open", label: "Open", icon: <GlobeIcon />},
          {key: "password", label: "Password", icon: <KeyIcon />},
          {key: "approval", label: "Approval", icon: <LockIcon />},
        ]}
        activeKey={activeOptionKey}
        onToggleMenu={toggleDropDown}
        onSelect={selectDropdownOption}
      />
    </div>
  );
};
