import {ReactNode} from "react";
import {useSelect} from "utils/hooks/useSelect";
import classNames from "classnames";
import "./SelectOption.scss";

export type SelectOptionProps = {
  label: string;
  description: string;
  icon: ReactNode;
  index?: number; // overridden by <Select> component
  children?: ReactNode; // optional extra content
};

export const SelectOption = (props: SelectOptionProps) => {
  if (props.index === undefined) throw new Error("undefined index, make sure to wrap <SelectOption> components inside a <Select> component or <SelectContext.Provider>");

  const {activeIndex, setActiveIndex} = useSelect();
  const isActive = activeIndex === props.index;

  const handleSelect = () => {
    if (props.index !== undefined) {
      setActiveIndex(props.index);
    }
  };

  const renderExtraContent = () => (props.children && isActive ? <div className="select-option__extra-content">{props.children}</div> : null);

  return (
    <button
      className={classNames("select-option", `select-option--${props.index}`, {"select-option--active": isActive}, {"select-option--extra": props.children})}
      onClick={handleSelect}
      tabIndex={0}
    >
      <div className="select-option__icon-container">{props.icon}</div>
      <div className="select-option__label">{props.label}</div>
      <div className="select-option__description">{props.description}</div>

      <input className="select-option__radio" type="radio" checked={isActive} onChange={handleSelect} />

      {renderExtraContent()}
    </button>
  );
};
