import * as React from 'react';

export const Icon: React.SFC<any> = ({ name, width = 32, height = 32 }) => (
  <span>
    {name} {width}x{height}
  </span>
);

export default Icon;
