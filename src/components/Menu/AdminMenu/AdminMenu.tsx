import React from 'react';
import './AdminMenu.scss';
import {ReactComponent as TimerIcon} from "assets/icon-timer-white.svg";
import MenuToggle from "../MenuToggle/MenuToggle";

function AdminMenu() {

    return (<div className='admin-menu'>
        <div className='admin-menu__items'>
            <MenuToggle index={1} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='END TIMER'>
                <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={2} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='END TIMER'>
                <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={3} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='END TIMER'>
                <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={4} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='END TIMER'>
                <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
        </div>
    </div>);
}

export default AdminMenu;