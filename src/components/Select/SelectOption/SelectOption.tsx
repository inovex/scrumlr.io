import "./SelectOption.scss";
import {ReactNode} from "react";
import {useSelect} from "utils/hooks/useSelect";

export type SelectOptionProps = {
  label: string;
  description: string;
  icon: ReactNode;
  index?: number; // overridden by <Select> component
};

export const SelectOption = (props: SelectOptionProps) => {
  const {activeIndex, setActiveIndex} = useSelect();

  const handleSelect = () => {
    if (props.index) {
      setActiveIndex(props.index);
    }
  };

  return (
    <div>
      <h4>
        {props.label} {activeIndex === props.index ? "active" : null}
      </h4>
      <p>{props.description}</p>
      {props.icon}
      <button onClick={handleSelect}>activate</button>
    </div>
  );
};
