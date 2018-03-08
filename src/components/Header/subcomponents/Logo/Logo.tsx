import * as React from 'react';
import * as cx from 'classnames';

import './Logo.css';

const logo = require(`!svg-inline-loader!./logo.svg`);
const logoSmall = require(`!svg-inline-loader!./logo-s.svg`);

export interface LogoProps {
  href?: string;
  className?: string;
}

const Logo: React.SFC<LogoProps> = ({ href, className }) => {
  const componentClassName = cx('header__logo-link', className);

  return (
    <a
      href={href}
      className={componentClassName}
      aria-label="Link back to home page"
    >
      <span
        className="header__logo-image"
        aria-hidden={true}
        dangerouslySetInnerHTML={{ __html: logo }}
      />
      <span
        className="header__logo-image-small"
        aria-hidden={true}
        dangerouslySetInnerHTML={{ __html: logoSmall }}
      />
    </a>
  );
};

Logo.defaultProps = {
  href: '/'
};

export default Logo;
