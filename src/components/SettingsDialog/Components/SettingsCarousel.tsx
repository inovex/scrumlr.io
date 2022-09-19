import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import "./SettingsCarousel.scss";
import classNames from "classnames";
import {useTranslation} from "react-i18next";

export interface SettingsCarouselProps<T> {
  disabled?: boolean;
  onValueChange?: (value: T) => unknown;
  carouselItems: readonly T[];
  localizationPath?: string;
  currentValue?: T;
  label?: string;
  className?: string;
}

export const SettingsCarousel = ({carouselItems, currentValue, onValueChange, localizationPath, label, className, disabled}: SettingsCarouselProps<string>) => {
  const {t} = useTranslation();

  const handleClick = (left = false) => {
    if (!onValueChange) return;
    const currentIndex = carouselItems.indexOf(currentValue ?? carouselItems[0]);
    if (left) {
      if (currentIndex <= 0) onValueChange(carouselItems[carouselItems.length - 1]);
      else onValueChange(carouselItems[currentIndex - 1]);
    } else if (currentIndex >= carouselItems.length - 1) onValueChange(carouselItems[0]);
    else onValueChange(carouselItems[currentIndex + 1]);
  };

  return (
    <div className={classNames("settings-carousel", className)}>
      <button className="settings-carousel__button settings-carousel__button--left" disabled={disabled} onClick={() => handleClick(true)}>
        <LeftArrowIcon />
      </button>
      <div className="settings-carousel__text">
        {label && <span className="settings-carousel__text-label">{label}</span>}
        <span className="settings-carousel__text-value">{localizationPath !== undefined ? t(`${localizationPath}${currentValue}`) : currentValue}</span>
      </div>
      <button className="settings-carousel__button settings-carousel__button--right" disabled={disabled} onClick={() => handleClick()}>
        <RightArrowIcon />
      </button>
    </div>
  );
};
