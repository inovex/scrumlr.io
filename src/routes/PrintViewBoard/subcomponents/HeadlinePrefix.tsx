import * as React from 'react';

export interface HeadlinePrefixProps {
  width: string;
  height: string;
  color: string;
  className?: string;
}

export const HeadlinePrefix: React.SFC<HeadlinePrefixProps> = props =>
  <span className={props.className}>
    <svg width={props.width} height={props.height} viewBox="0 0 50 15">
      <g>
        <rect x="0" y="0" width="50" height="15" fill={props.color} />
      </g>
    </svg>
  </span>;

export default HeadlinePrefix;
