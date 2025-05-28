import {Select} from "components/Select/Select";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "components/Button";
import {AccessPolicy, CreateSessionAccessPolicy} from "store/features";
import "./AccessSettings.scss";
import {Input} from "components/Input/Input";

type AccessSettingsProps = {
  onCancel: () => void;
  onSelectSessionPolicy: (accessPolicyData: CreateSessionAccessPolicy) => void;
};

// yes, this modal can also be abstracted / generalized if need be
export const AccessSettings = (props: AccessSettingsProps) => {
  const {t} = useTranslation();

  const [activeAccessSettingIndex, setActiveAccessSettingIndex] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");

  const matchAccessPolicy = (): AccessPolicy => {
    switch (activeAccessSettingIndex) {
      case 0:
        return "PUBLIC";
      case 1:
        return "BY_INVITE";
      case 2:
        return "BY_PASSPHRASE";
      default:
        return "PUBLIC";
    }
  };

  const disableIfEmptyPassword = matchAccessPolicy() === "BY_PASSPHRASE" && !passwordInput;

  const getSessionAccessPolicy = (): CreateSessionAccessPolicy => {
    const policy = matchAccessPolicy();
    if (policy === "BY_PASSPHRASE") {
      return {policy, passphrase: passwordInput};
    }
    return {policy};
  };

  const onStartSession = () => {
    const sessionPolicy = getSessionAccessPolicy();
    props.onSelectSessionPolicy(sessionPolicy);
  };

  return (
    <div className="access-settings__wrapper">
      <div className="access-settings">
        <header className="access-settings__header">
          <div className="access-settings__title">Access Settings</div>
        </header>
        <main className="access-settings__main">
          <Select activeIndex={activeAccessSettingIndex} setActiveIndex={setActiveAccessSettingIndex}>
            <SelectOption label={t("Templates.AccessSettings.Public.title")} description={t("Templates.AccessSettings.Public.description")} icon={<GlobeIcon />} />
            <SelectOption label={t("Templates.AccessSettings.By_Invite.title")} description={t("Templates.AccessSettings.By_Invite.description")} icon={<LockIcon />} />
            <SelectOption label={t("Templates.AccessSettings.By_Passphrase.title")} description={t("Templates.AccessSettings.By_Passphrase.description")} icon={<KeyIcon />}>
              <Input type="password" required input={passwordInput} setInput={setPasswordInput} height="normal" />
            </SelectOption>
          </Select>
        </main>
        <footer className="access-settings__footer">
          <Button type="secondary" onClick={props.onCancel}>
            Go back
          </Button>
          <Button type="primary" onClick={onStartSession} disabled={disableIfEmptyPassword}>
            Start Session
          </Button>
        </footer>
      </div>
    </div>
  );
};
