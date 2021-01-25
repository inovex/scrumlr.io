import React, {useState} from 'react';
import './MenuButton.scss';

type MenuButtonProps = {
    toggle: boolean; // Button functions as toggle
    onToggle: (toggle: boolean) => void; // What should happen onToggle / onClick

    toggleStartLabel: string;
    toggleEndLabel: string;

    children?: React.ReactNode;
}

function MenuButton(props: MenuButtonProps) {

    const [active, changeStatus] = useState(false);

    return (<button className={'menu-button'} onClick={_ => changeStatus(!active)}>
        <span className='menu-button__tooltip'>{active ? props.toggleEndLabel : props.toggleStartLabel}</span>
        {!active ? props.children : 'X'}
    </button>);
}

export default MenuButton;