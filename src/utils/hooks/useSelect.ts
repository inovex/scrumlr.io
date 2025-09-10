import {createContext, useContext} from "react";

export const SelectContext = createContext<{activeIndex: number | null; setActiveIndex: (index: number) => void} | undefined>(undefined);

export const useSelect = () => {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error("useSelect must be used within a SelectProvider");
  }
  return context;
};
