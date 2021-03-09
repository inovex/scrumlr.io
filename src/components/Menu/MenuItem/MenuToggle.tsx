import React, { useState } from 'react';
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import './MenuItem.scss';

type MenuToggleProps = {
    children: React.ReactNode;
    direction: 'left' | 'right';
    index: number;
    onToggle?: (active: boolean) => void;
    toggleStartLabel: string;
    toggleStopLabel: string;
}

function MenuToggle(props: MenuToggleProps) {

    const [status, setStatus] = useState(false);

    return (<button 
                className={`menu-item menu-item${props.index} menu-item${status ? '--active' : '--disabled'} menu-item--${props.direction}`}
                onClick={_ => setStatus(prevValue => !prevValue)}
            >
        <div className='menu-item__tooltip'>
            <span className='tooltip__text'>
                {status ? props.toggleStopLabel : props.toggleStartLabel}
            </span>
        </div>
        <CloseIcon className='menu-item__icon menu-item__icon--end'/>
        {props.children}
    </button>);
}

export default MenuToggle;