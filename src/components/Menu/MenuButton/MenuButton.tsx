import React from 'react';
import './MenuButton.scss';

type MenuButtonProps = {
    children: React.ReactNode;
    direction: 'left' | 'right';
    index: number;
    onClick?: () => void;
    label: string;
}

function MenuButton(props: MenuButtonProps) {

    return (<button 
                className={`menu-button menu-button${props.index} menu-button--${props.direction}`}
                onClick={props.onClick}
            >
        <div className='menu-button__tooltip'>
            <span className='tooltip__text'>
                {props.label}
            </span>
        </div>
        {props.children}
    </button>);
}

export default MenuButton;