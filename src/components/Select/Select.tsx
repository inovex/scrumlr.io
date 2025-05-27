import {Children, cloneElement, isValidElement, ReactElement} from "react";
import {SelectOptionProps} from "components/Select/SelectOption/SelectOption";
import {SelectContext} from "utils/hooks/useSelect";
import "./Select.scss";

type SelectProps = {
  children: ReactElement<SelectOptionProps> | ReactElement<SelectOptionProps>[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

// general select component
// add <SelectOption> elements as children
export const Select = ({children, activeIndex, setActiveIndex}: SelectProps) => (
  <SelectContext.Provider value={{activeIndex, setActiveIndex}}>
    <div className="select">{Children.map(children, (child, index) => (isValidElement<SelectOptionProps>(child) ? cloneElement(child, {index}) : null))}</div>
  </SelectContext.Provider>
);
