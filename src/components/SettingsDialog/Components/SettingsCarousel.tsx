import {useEffect, useState, VFC} from "react";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import "./SettingsCarousel.scss";
import classNames from "classnames";
import {useTranslation} from "react-i18next";

export interface SettingsCarouselProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange?: (value: T) => unknown;
  carouselItems: readonly T[];
  localizationPath?: string;
  initialValue?: T;
  label?: string;
  className?: string;
}

export const SettingsCarousel: VFC<SettingsCarouselProps<string>> = ({carouselItems, initialValue, onValueChange, localizationPath, label, className}) => {
  const {t} = useTranslation();

  const index = carouselItems.indexOf(initialValue ?? "");
  const [selection, setSelection] = useState(index >= 0 ? index : 0);

  useEffect(() => {
    if (onValueChange) onValueChange(carouselItems[selection]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, carouselItems]);

  const handleClick = (left = false) => {
    if (left) {
      if (selection <= 0) setSelection(carouselItems.length - 1);
      else setSelection(selection - 1);
    } else if (selection >= carouselItems.length - 1) setSelection(0);
    else setSelection(selection + 1);
  };

  return (
    <div className={classNames("settings-carousel", className)}>
      <button className="settings-carousel__button settings-carousel__button--left" onClick={() => handleClick(true)}>
        <LeftArrowIcon />
      </button>
      <div className="settings-carousel__text">
        {label && <span className="settings-carousel__text-label">{label}</span>}
        <span className="settings-carousel__text-value">{localizationPath !== undefined ? t(`${localizationPath}${carouselItems[selection]}`) : carouselItems[selection]}</span>
      </div>
      <button className="settings-carousel__button settings-carousel__button--right" onClick={() => handleClick()}>
        <RightArrowIcon />
      </button>
    </div>
  );
};
