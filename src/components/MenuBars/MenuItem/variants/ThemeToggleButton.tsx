import {useEffect, useState} from "react";
import classNames from "classnames";
import "../MenuItem.scss";
import {TabIndex} from "constants/tabIndex";
import {ReactComponent as LightMode} from "assets/icon-lightmode.svg";
import {ReactComponent as DarkMode} from "assets/icon-darkmode.svg";
import {useTranslation} from "react-i18next";

type ThemeToggleButtonProps = {
  direction: "left" | "right";
  disabled?: boolean;
  tabIndex?: number;
};

export var ThemeToggleButton = function (props: ThemeToggleButtonProps) {
  const [touchHover, setTouchHover] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute("theme"));
  const {t} = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute("theme", theme!);
    localStorage.setItem("theme", theme!);
  }, [theme]);

  return (
    <button
      disabled={props.disabled}
      className={classNames("menu-item", `menu-item--${props.direction}`, {
        "menu-item--touch-hover": touchHover,
      })}
      onClick={() => {
        if (document.getElementsByClassName("menu-item--touch-hover").length === 0) {
          setTheme((prev) => (prev === "light" ? "dark" : "light"));
        }
      }}
      onTouchEnd={(e) => {
        if (!touchHover && document.getElementsByClassName("menu-item--touch-hover").length === 0) {
          e.preventDefault();
          window.addEventListener("click", () => setTouchHover(false), {once: true});
          setTouchHover(true);
        }
        if (touchHover) {
          e.preventDefault();
          setTouchHover(false);
          setTheme((prev) => (prev === "light" ? "dark" : "light"));
        }
      }}
      tabIndex={props.tabIndex ?? TabIndex.default}
    >
      <div className="menu-item__tooltip">
        <span className="tooltip__text">{t("MenuBars.themeToggle")}</span>
      </div>
      {theme === "light" && <DarkMode className="menu-item__icon" />}
      {theme === "dark" && <LightMode className="menu-item__icon" />}
    </button>
  );
};
