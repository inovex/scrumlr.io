import React from 'react';
import './HeaderLogo.scss';
import logoLight from "assets/logo-scrumlr-on-light.svg";
import logoLightSmall from "assets/logo-scrumlr-on-light-small.svg";
import logoDark from 'assets/logo-scrumlr-on-dark.svg';
import logoDarkSmall from 'assets/logo-scrumlr-on-dark-small.svg';

const HeaderLogo = () => {
    return (
        <div className="board-header__logo">
            <img className="board-header__logo-img board-header__logo-light" src={logoLight} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-light-small" src={logoLightSmall} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-dark" src={logoDark} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-dark-small" src={logoDarkSmall} alt="Logo"/>
        </div>
    );
};
export default HeaderLogo; 