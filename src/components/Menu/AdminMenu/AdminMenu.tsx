import React from 'react';
import './AdminMenu.scss';
import {ReactComponent as TimerIconWhite} from "assets/icon-timer-white.svg";
import {ReactComponent as TimerIconRed} from "assets/icon-timer-red.svg";

function AdminMenu() {

    return (<div className='admin-menu'>
        <div className='admin-menu__items'>
            <button className='admin-menu__item'>
                <TimerIconWhite className='admin-menu__item-icon--white'/>
                <TimerIconRed className='admin-menu__item-icon--red'/>
            </button>
            <button className='admin-menu__item'>
                <TimerIconWhite className='admin-menu__item-icon--white'/>
                <TimerIconRed className='admin-menu__item-icon--red'/>
            </button>
            <button className='admin-menu__item'>
                <TimerIconWhite className='admin-menu__item-icon--white'/>
                <TimerIconRed className='admin-menu__item-icon--red'/>
            </button>
            <button className='admin-menu__item'>
                <TimerIconWhite className='admin-menu__item-icon--white'/>
                <TimerIconRed className='admin-menu__item-icon--red'/>
            </button>
        </div>
    </div>);
}

export default AdminMenu;

// <div className={'board__admin-menu'}>
//     <div className={'admin-menu__items'}>
//         <button className={'admin-menu__item'}>
//             <TimerIcon className={'admin-menu__item-icon'}/>
//         </button>
//         <button className={'admin-menu__item'}>
//             <TimerIcon className={'admin-menu__item-icon'}/>
//         </button>
//         <button className={'admin-menu__item'}>
//             <TimerIcon className={'admin-menu__item-icon'}/>
//         </button>
//         <button className={'admin-menu__item'}>
//             <TimerIcon className={'admin-menu__item-icon'}/>
//         </button>
//     </div>
// </div>