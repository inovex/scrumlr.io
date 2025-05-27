import "./AccessSettings.scss";
import {Select} from "components/Select/Select";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import {ReactComponent as Icon} from "assets/icons/info.svg";
import {useState} from "react";

// yes, this modal can also be abstracted / generalized if need be
export const AccessSettings = () => {
  const [activeAccessSettingIndex, setActiveAccessSettingIndex] = useState(0);

  return (
    <div className="access-settings__wrapper">
      <div className="access-settings">
        <header className="access-settings__header">
          <div className="access-settings__title">Access Settings</div>
        </header>
        <main className="access-settings__main">
          <Select activeIndex={activeAccessSettingIndex} setActiveIndex={setActiveAccessSettingIndex}>
            <SelectOption label="test" description="wow" icon={<Icon />} />
            <SelectOption label="another" description="amazing" icon={<Icon />} />
          </Select>
        </main>
        <footer className="access-settings__footer">
          <button className="access-settings__cancel">Go back</button>
          <button className="access-settings__start">Start Session</button>
        </footer>
      </div>
    </div>
  );
};
