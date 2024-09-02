import {RefObject, useLayoutEffect, useState} from "react";
import useResizeObserver from "@react-hook/resize-observer";

// this hook returns the current dimensions of a reference html element
export const useSize = (target: RefObject<HTMLElement>, {includePosition}: {includePosition?: boolean} = {}) => {
  const [size, setSize] = useState<DOMRect>();

  useLayoutEffect(() => setSize(target.current?.getBoundingClientRect()), [target]);
  useResizeObserver(target, (entry) => {
    setSize(includePosition ? target.current?.getBoundingClientRect() : entry.contentRect);
  });
  return size;
};
