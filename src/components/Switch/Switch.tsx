import {useState} from "react";
import "./Switch.scss";

export const Switch = () => {
  const [active, setActive] = useState("Templates");

  const handleSwitch = (section: string) => {
    setActive(section);
  };

  return (
    <div className="switch-container">
      <div className={`switch-item ${active === "Templates" ? "active" : ""}`} onClick={() => handleSwitch("Templates")}>
        Templates
      </div>
      <div className={`switch-item ${active === "Sessions" ? "active" : ""}`} onClick={() => handleSwitch("Sessions")}>
        Sessions
      </div>
    </div>
  );
};
