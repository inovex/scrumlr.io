import React, {useEffect, useState} from 'react';
import './MenuButton.scss';
import {ReactComponent as CloseIcon} from "assets/icon-close-white.svg";

type MenuButtonProps = {
    index: number;

    onToggle: (active: boolean) => void; // What should happen onToggle / onClick

    toggleStartLabel: string;
    toggleStopLabel: string;

    direction: 'left' | 'right';

    children: React.ReactNode;
}

function MenuButton(props: MenuButtonProps) {

    const [status, setStatus] = useState(false);

    useEffect(() => {
        props.onToggle(status);
    }, [status]);


    return (<button className={`menu-button ${status ? 'menu-button--active':'menu-button--disabled'} menu-button--${props.direction} menu-button${props.index}`} onClick={_ => setStatus(currStatus => !currStatus)}>
        <div className='menu-button__tooltip'><span className='tooltip-text'>{!status ? props.toggleStartLabel : props.toggleStopLabel}</span></div>
        {status ?  <CloseIcon className='menu-button__icon menu-button__icon--close'/> : props.children}
    </button>);
}

export default MenuButton;

/**
 * TODOLIST
 *
 * TODO: Create additional MenuToggle component (button: onClick, toggle: onToggle with curr State)
 * TODO: Create mobile / responsive touch events
 * TODO: Add styling for mobile / responsive
 * TODO: Testing
 * TODO: Add README for button and toggle component
 *
 */
