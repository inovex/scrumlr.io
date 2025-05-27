import "./Select.scss";
import {Children, cloneElement, isValidElement, ReactElement, useState} from "react";
import {SelectOption, SelectOptionProps} from "components/Select/SelectOption/SelectOption";
import {SelectContext} from "utils/hooks/useSelect";

type SelectProps = {
  children: ReactElement<typeof SelectOption> | ReactElement<typeof SelectOption>[];
};

// general select component
// add <SelectOption> elements as children
export const Select = ({children}: SelectProps) => {
  const [activeIndex, setActiveIndex] = useState(0); // pre-select first element

  return (
    <SelectContext.Provider value={{activeIndex, setActiveIndex}}>
      <div className="select">{Children.map(children, (child, index) => (isValidElement<SelectOptionProps>(child) ? cloneElement(child, {index}) : null))}</div>
    </SelectContext.Provider>
  );
};
