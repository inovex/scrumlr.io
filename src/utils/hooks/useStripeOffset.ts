import {DetailedHTMLProps, HTMLProps, useCallback, useEffect, useRef, useState} from "react";

/**
 * this function sets the css offset variable for a repeating css gradient so that the gradient is uniform across multiple elements
 * we can't use the css `background-offset` property because it will cause a break in the gradient.
 *
 * instead shift the gradient start point like this:
 * ```css
 * .striped {
 *   --stripe-offset: 0px;
 *   background-image: repeating-linear-gradient(
 *    45deg,
 *    transparent calc(0px + var(--stripe-offset)),
 *    transparent calc(20px + var(--stripe-offset)),
 *    #fff calc(20px + var(--stripe-offset)),
 *    #fff calc(40px + var(--stripe-offset))
 *   );
 * }
 * ```
 *
 * @param gradientLength the length of the gradient **in pixels** until it repeats as specified in the css
 * @param gradientAngle the angle of the gradient **in degrees** as specified in the css
 * @param phaseOffset optional phase offset of the stripe, one phase = 1
 * @param cssVariableName the name of the css offset variable
 *
 */
export function useStripeOffset({
  gradientLength = 40,
  gradientAngle = 45, // TODO this ins't fully implemented & tested
  phaseOffset = 0,
  cssVariableName = "stripe-offset",
}: {
  gradientLength?: number;
  gradientAngle?: number;
  phaseOffset?: number;
  cssVariableName?: string;
} = {}) {
  const gradientAngleRad = (gradientAngle / 180) * Math.PI;
  const repeatHeight = gradientLength / Math.sin(gradientAngleRad);
  const repeatWidth = gradientLength / Math.cos(gradientAngleRad);

  const ref = useRef<HTMLElement | null>(null);

  const [offset, setOffset] = useState(0);

  const updateOffset = useCallback(() => {
    // TODO throttle?
    if (!ref.current || typeof window === undefined) return;

    const {left, bottom} = ref.current.getBoundingClientRect();

    const elementX = (left + window.scrollX) % repeatWidth;
    const elementY = (bottom + window.scrollY) % repeatHeight;

    setOffset(elementY * Math.sin(gradientAngleRad) - elementX * Math.cos(gradientAngleRad));
  }, [gradientAngleRad, repeatHeight, repeatWidth]);

  useEffect(() => {
    updateOffset();
  }, [updateOffset]);

  useEffect(() => {
    if (!ref.current) return () => {};

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target !== ref.current) return;

        updateOffset();
      });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  });

  const finalOffset = offset + phaseOffset * gradientLength;

  return {
    ref,
    style: {
      [`--${cssVariableName}`]: `${finalOffset}px`,
    },
  } satisfies DetailedHTMLProps<HTMLProps<HTMLElement>, HTMLElement>;
}
