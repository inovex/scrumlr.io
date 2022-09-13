import {VFC} from "react";

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

interface ProgressCircleProps {
  percentage: number;
  className?: string;
}

/**
 * @param percentage a value between 0 and 1
 */
export const ProgressCircle: VFC<ProgressCircleProps> = ({percentage, className}) => {
  // can not be 1, otherwise no circle will be drawn
  percentage = Math.min(Math.max(percentage, 0), 0.99999);

  const endAngle = 360 * percentage ?? 0;

  const start = polarToCartesian(50, 50, 50, endAngle);
  const end = polarToCartesian(50, 50, 50, 0);

  const largeArcFlag = endAngle <= 180 ? 0 : 1;

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path d={`M ${start.x} ${start.y} A 50 50 0 ${largeArcFlag} 0 ${end.x} ${end.y} L 50 50 Z`} />
    </svg>
  );
};
