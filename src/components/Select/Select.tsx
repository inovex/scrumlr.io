import {Children, cloneElement, isValidElement, ReactElement, useMemo} from "react";
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
export const Select = ({children, activeIndex, setActiveIndex}: SelectProps) => {
  // memoize the context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({activeIndex, setActiveIndex}), [activeIndex, setActiveIndex]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="select">{Children.map(children, (child, index) => (isValidElement<SelectOptionProps>(child) ? cloneElement(child, {index}) : null))}</div>
    </SelectContext.Provider>
  );
};
