import React from 'react';
import './HeaderLogo.scss';
import logoLight from "assets/logo-scrumlr-on-light.svg";
import logoLightSmall from "assets/logo-scrumlr-on-light-small.svg";
import logoDark from 'assets/logo-scrumlr-on-dark.svg';
import logoDarkSmall from 'assets/logo-scrumlr-on-dark-small.svg';

const HeaderLogo = () => {
    return (
        <div className="board-header__logo">
            <img className="board-header__logo-img board-header__logo-light" area-hidden={true} src={logoLight} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-light-small" area-hidden={true} src={logoLightSmall} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-dark" area-hidden={true} src={logoDark} alt="Logo"/>
            <img className="board-header__logo-img board-header__logo-dark-small" area-hidden={true} src={logoDarkSmall} alt="Logo"/>
        </div>
    );
};
export default HeaderLogo; 