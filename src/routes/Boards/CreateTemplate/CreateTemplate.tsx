import {useState} from "react";
import {useTranslation} from "react-i18next";
import {AccessPolicy} from "store/features";
import {Dropdown} from "components/Dropdown/Dropdown";
import {Input} from "components/Input/Input";
import {TextArea} from "components/TextArea/TextArea";
import {ColumnsConfigurator} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as ShuffleIcon} from "assets/icons/shuffle.svg";
import {ReactComponent as InfoIcon} from "assets/icons/info.svg";
import classNames from "classnames";
import {Button} from "components/Button";
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
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

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
        <div className="create-template__password-wrapper">
          <ShuffleIcon className="create-template__shuffle-icon" />
          <Input className="create-template__password-wrapper" type="password" height="normal" input={passwordInput} setInput={setPasswordInput} placeholder="Password" />
        </div>
      )}

      <div className="create-template__info">
        <InfoIcon className="create-template__info-icon" />
        <div className="create-template__info-text">{t(`CreateBoard.info.${getAccessPolicyTranslationKey(activeOptionKey)}`)}</div>
      </div>
      <div className="create-template__name">
        <Input type="text" input={nameInput} setInput={setNameInput} height="normal" placeholder="Board name" />
      </div>
      <div className="create-template__description">
        <TextArea className="create-template__description-text-area" input={descriptionInput} setInput={setDescriptionInput} placeholder="Description (optional)" />
      </div>
      <div className="create-template__columns-configurator-wrapper">
        <ColumnsConfigurator className="create-template__columns-configurator" />
      </div>
      <div className="create-template__buttons">
        <Button className={classNames("create-template__button", "create-template__button--return")} type="secondary">
          Go Back
        </Button>
        <Button className={classNames("create-template__button", "create-template__button--create")} type="primary">
          Create Board
        </Button>
      </div>
    </div>
  );
};
