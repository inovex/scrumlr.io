import {Dropdown} from "components/Dropdown/Dropdown";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import "./CreateTemplate.scss";

export const CreateTemplate = () => (
  <div className="create-template">
    <Dropdown
      options={[
        {key: "open", label: "Open", icon: <GlobeIcon />},
        {key: "password", label: "Password", icon: <KeyIcon />},
        {key: "approval", label: "Approval", icon: <LockIcon />},
      ]}
      activeKey="open"
    />
  </div>
);
