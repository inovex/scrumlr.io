import React from 'react';
import './MenuItem.scss';

type MenuButtonProps = {
    children: React.ReactNode;
    direction: 'left' | 'right';
    index: number;
    onClick?: () => void;
    label: string;
}

function MenuButton(props: MenuButtonProps) {

    return (<button 
                className={`menu-item menu-item${props.index} menu-item--${props.direction}`}
                onClick={props.onClick}
            >
        <div className='menu-item__tooltip'>
            <span className='tooltip__text'>
                {props.label}
            </span>
        </div>
        {props.children}
    </button>);
}

export default MenuButton;