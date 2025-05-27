import {ReactNode} from "react";
import {useSelect} from "utils/hooks/useSelect";
import classNames from "classnames";
import "./SelectOption.scss";

export type SelectOptionProps = {
  label: string;
  description: string;
  icon: ReactNode;
  index?: number; // overridden by <Select> component
};

export const SelectOption = (props: SelectOptionProps) => {
  const {activeIndex, setActiveIndex} = useSelect();
  const isActive = activeIndex === props.index;

  const handleSelect = () => {
    if (props.index !== undefined) {
      setActiveIndex(props.index);
    }
  };

  return (
    <div className={classNames("select-option", `select-option--${props.index}`, {"select-option--active": isActive})}>
      <div className="select-option__icon-container">{props.icon}</div>
      <div className="select-option__label">{props.label}</div>
      <div className="select-option__description">{props.description}</div>

      <input className="select-option__radio" type="radio" checked={isActive} onChange={handleSelect} />
    </div>
  );
};
