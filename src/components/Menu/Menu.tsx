import {useState} from 'react';
import MenuButton from 'components/Menu/MenuItem/MenuButton';
import MenuToggle from 'components/Menu/MenuItem/MenuToggle';
import { ReactComponent as AddImageIcon } from 'assets/icon-addimage.svg';
import { ReactComponent as AddStickerIcon } from 'assets/icon-addsticker.svg';
import { ReactComponent as CheckIcon } from 'assets/icon-check.svg';
import { ReactComponent as SettingsIcon } from 'assets/icon-settings.svg';
import { ReactComponent as ColumnIcon } from 'assets/icon-column.svg';
import { ReactComponent as FocusIcon } from 'assets/icon-focus.svg';
import { ReactComponent as TimerIcon } from 'assets/icon-timer.svg';
import { ReactComponent as VoteIcon } from 'assets/icon-vote.svg';
import './Menu.scss';

function Menu() {

    const [showAdminMenu, toggleMenus] = useState(false); 

    return (
        <div className={`menu-bars menu-bars--${showAdminMenu ? 'admin' : 'user'}`}>
            <div className='menu user-menu'>
                <div className='menu__items'>
                    <MenuToggle index={1} direction='right' toggleStartLabel='MARK ME AS DONE' toggleStopLabel='UNMARK ME AS DONE'>
                        <CheckIcon className='menu-item__icon menu-it em__icon--start' />
                    </MenuToggle>
                    <MenuButton index={2} direction='right' label='ADD IMAGE OR GIPHY'>
                        <AddImageIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuButton>
                    <MenuButton index={3} direction='right' label='ADD STICKER'>
                        <AddStickerIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuButton>
                    <MenuButton index={4} direction='right' label='SETTINGS'>
                        <SettingsIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuButton>
                </div>
            </div>
            <div className='menu admin-menu'>
                <div className='menu__items'>
                    <MenuToggle index={1} direction='left' toggleStartLabel='START COLUMN MODE' toggleStopLabel='END COLUMN MODE'>
                        <ColumnIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuToggle>
                    <MenuToggle index={2} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='STOP TIMER'>
                        <TimerIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuToggle>
                    <MenuToggle index={3} direction='left' toggleStartLabel='START VOTING PHASE' toggleStopLabel='END VOTING PHASE'>
                        <VoteIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuToggle>
                    <MenuToggle index={4} direction='left' toggleStartLabel='START FOCUSED MODE' toggleStopLabel='END FOCUSED MODE'>
                        <FocusIcon className='menu-item__icon menu-item__icon--start' />
                    </MenuToggle>
                </div>
            </div>
            <button className='menu-bars__switch' onClick={_ => toggleMenus(prevState => !prevState)}>
                <VoteIcon className='switch__icon'/>
            </button>
        </div>
    );
}

export default Menu;