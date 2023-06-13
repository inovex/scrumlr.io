import {RefObject, useLayoutEffect, useState} from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import useResizeObserver from "@react-hook/resize-observer";

// this hook returns the current dimensions of a reference html element
export const useSize = (target: RefObject<HTMLElement>) => {
  const [size, setSize] = useState<DOMRect>();

  useLayoutEffect(() => setSize(target.current?.getBoundingClientRect()), [target]);
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};
