import {useState} from "react";
import {useTranslation} from "react-i18next";
import {AccessPolicy} from "types/board";
import {Dropdown} from "components/Dropdown/Dropdown";
import {Input} from "components/Input/Input";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as InfoIcon} from "assets/icons/info.svg";
import "./CreateTemplate.scss";

const getAccessPolicyTranslationKey = (policy: AccessPolicy) => {
  switch (policy) {
    case AccessPolicy.PUBLIC:
      return "open";
    case AccessPolicy.BY_PASSPHRASE:
      return "password";
    default:
      return "approval";
  }
};

export const CreateTemplate = () => {
  const {t} = useTranslation();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<AccessPolicy>(AccessPolicy.PUBLIC);

  const [passwordInput, setPasswordInput] = useState("");

  const toggleDropDown = () => setOpenDropdown((curr) => !curr);
  const selectDropdownOption = (key: AccessPolicy) => {
    setActiveOptionKey(key);
    setOpenDropdown(false);
  };

  return (
    <div className="create-template">
      <Dropdown<AccessPolicy>
        className="create-template__dropdown"
        open={openDropdown}
        options={[
          {key: AccessPolicy.PUBLIC, label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey(AccessPolicy.PUBLIC)}`), icon: <GlobeIcon />},
          {key: AccessPolicy.BY_PASSPHRASE, label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey(AccessPolicy.BY_PASSPHRASE)}`), icon: <KeyIcon />},
          {key: AccessPolicy.BY_INVITE, label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey(AccessPolicy.BY_INVITE)}`), icon: <LockIcon />},
        ]}
        activeKey={activeOptionKey}
        onToggleMenu={toggleDropDown}
        onSelect={selectDropdownOption}
      />

      {activeOptionKey === AccessPolicy.BY_PASSPHRASE && (
        <Input className="create-template__password" type="password" height="normal" input={passwordInput} setInput={setPasswordInput} />
      )}

      <div className="create-template__info">
        <InfoIcon className="create-template__info-icon" />
        <div className="create-template__info-text">{t(`CreateBoard.info.${getAccessPolicyTranslationKey(activeOptionKey)}`)}</div>
      </div>
      <div className="create-template__name">Name</div>
      <div className="create-template__description">Description</div>
      <div className="create-template__columns">Columns</div>
      <div className="create-template__buttons">Buttons</div>
    </div>
  );
};
