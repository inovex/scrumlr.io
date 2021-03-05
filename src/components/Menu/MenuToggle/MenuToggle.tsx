import React from 'react';

type MenuToggleProps = {

    icon: React.Component;
}

function MenuToggle(props: MenuToggleProps) {



    return (<button className='menu-toggle'>
        <div className='menu-toggle__tooltip'>
            <span className='tooltip__text'>

            </span>
        </div>

        {props.icon}
    </button>)
}

export default MenuToggle;