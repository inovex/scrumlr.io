import {DetailedHTMLProps, HTMLProps, useCallback, useEffect, useMemo, useRef, useState} from "react";

/**
 * this function sets the css offset variable for a repeating css gradient so that the gradient is uniform across multiple elements
 * we can't use the css `background-offset` property because it will cause a break in the gradient.
 *
 * instead shift the gradient start point with a css variable like this:
 * ```css
 * .striped {
 *   background-image: repeating-linear-gradient(
 *    45deg,
 *    transparent calc(0px  + var(--stripe-offset, 0px)),
 *    transparent calc(20px + var(--stripe-offset, 0px)),
 *    #fff        calc(20px + var(--stripe-offset, 0px)),
 *    #fff        calc(40px + var(--stripe-offset, 0px))
 *   );
 * }
 * ```
 *
 * the hook takes care of updating the offset when the element size changes but not when the dom changes, since it would need to observe the whole tree
 * if the position of the striped element changes, you will need to call `updateOffset` manually
 *
 * @param gradientLength the length of the gradient **in pixels** until it repeats as specified in the css
 * @param gradientAngle the angle of the gradient **in degrees** as specified in the css
 * @param phaseOffset optional phase offset of the stripe, one phase = 1
 * @param cssVariableName the name of the css offset variable
 *
 */
export function useStripeOffset<RefElement extends HTMLElement>({
  gradientLength = 40,
  gradientAngle = 45,
  phaseOffset = 0,
  cssVariableName = "stripe-offset",
}: {
  gradientLength?: number;
  gradientAngle?: number;
  phaseOffset?: number;
  cssVariableName?: string;
} = {}) {
  // convert degrees to radians because Math.sin and Math.cos expect radians
  const gradientAngleRad = (gradientAngle / 180) * Math.PI;

  const stripedElementRef = useRef<RefElement | null>(null);

  const [offset, setOffset] = useState(0);

  const updateOffset = useCallback(() => {
    if (!stripedElementRef.current || typeof window === undefined) return;

    // find the origin of the gradient on the page, independent of scroll of parent elements
    let el: HTMLElement | null = stripedElementRef.current;

    let stripeOriginX = 0;
    let stripeOriginY = 0;

    do {
      stripeOriginX += el.offsetLeft;
      stripeOriginY += el.offsetTop;

      // loop over every parent element to sum up the offset
      el = el.offsetParent as HTMLElement | null;
    } while (el !== null);

    // depending on the angle, the gradient starts on a different edge of the element
    if (Math.sin(gradientAngleRad) < 0) stripeOriginX += stripedElementRef.current.getBoundingClientRect().width; // gradient starts on the right edge
    if (Math.cos(gradientAngleRad) > 0) stripeOriginY += stripedElementRef.current.getBoundingClientRect().height; // gradient starts on the bottom edge

    // calculate the distance from the gradient origin to the "zero-line"
    // the zero-line is a line at (0/0) with the same direction as the gradient stripes
    const distanceToLine = -stripeOriginX * Math.cos(gradientAngleRad - 0.5 * Math.PI) + stripeOriginY * Math.sin(gradientAngleRad - 0.5 * Math.PI);

    // take the offset modulo the length to lower the offset amount
    // add in the phase offset to shift the gradient
    setOffset((distanceToLine + phaseOffset * gradientLength) % gradientLength);
  }, [gradientAngleRad, gradientLength, phaseOffset]);

  // update the offset when the element size changes
  // this also updates on mount since the ResizeObserver fires on `observe()` call
  useEffect(() => {
    if (!stripedElementRef.current) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      updateOffset();
    });

    resizeObserver.observe(stripedElementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateOffset]);

  return useMemo(
    () => ({
      bindings: {
        ref: stripedElementRef,
        style: {
          [`--${cssVariableName}`]: `${offset}px`,
        },
      } satisfies DetailedHTMLProps<HTMLProps<RefElement>, RefElement>,
      updateOffset,
    }),
    [cssVariableName, offset, updateOffset]
  );
}
