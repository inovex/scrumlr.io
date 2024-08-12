import {Dropdown} from "components/Dropdown/Dropdown";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./CreateTemplate.scss";

export const CreateTemplate = () => (
  <div className="create-template">
    <Dropdown
      options={[
        {label: "Open", icon: <GlobeIcon />},
        {label: "Password", icon: <KeyIcon />},
        {label: "Approval", icon: <LockIcon />},
      ]}
      activeIndex={0}
    />
  </div>
);
