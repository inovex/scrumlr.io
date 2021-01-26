import React, {useState} from 'react';
import './MenuButton.scss';
import {ReactComponent as CloseIcon} from "assets/icon-close-white.svg";

type MenuButtonProps = {
    toggle: boolean; // Button functions as toggle
    onToggle: (toggle: boolean) => void; // What should happen onToggle / onClick

    toggleStartLabel: string;
    toggleEndLabel: string;

    children?: React.ReactNode;
}

function MenuButton(props: MenuButtonProps) {

    const [active, changeStatus] = useState(false);

    return (<button className={`menu-button ${active ? 'menu-button--active':'menu-button--disabled'}`} onClick={_ => changeStatus(!active)}>
        <span className='menu-button__tooltip'>{active ? props.toggleEndLabel : props.toggleStartLabel}</span>
        {props.children}
        <CloseIcon className='menu-button__icon menu-button__icon--close'/>
    </button>);
}

export default MenuButton;