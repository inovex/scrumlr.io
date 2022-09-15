import {VFC} from "react";

interface ProgressCircleProps {
  className?: string;
  percentage: number;
}

export const ProgressCircle: VFC<ProgressCircleProps> = ({percentage, className}) => {
  // clamp between 0 and 1
  percentage = Math.min(Math.max(percentage, 0), 1);
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle
        cx="50%"
        cy="50%"
        r="50%"
        strokeWidth="100%"
        strokeDasharray={`${Math.PI * 100}%`}
        strokeDashoffset={`${Math.PI * 100 * (1 - percentage)}%`}
        transform="rotate (-90 50 50)"
      />
    </svg>
  );
};
