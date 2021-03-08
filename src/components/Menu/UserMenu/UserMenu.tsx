import MenuButton from 'components/Menu/MenuButton/MenuButton';
import MenuToggle from 'components/Menu/MenuToggle/MenuToggle';
import {ReactComponent as TimerIcon} from 'assets/icon-timer.svg';
import './UserMenu.scss';

function UserMenu() {

    return (
        <div className='user-menu'>
            <div className='user-menu__items'>
                <MenuToggle index={1} direction='right' toggleStartLabel='MARK ME AS DONE' toggleStopLabel='UNMARK ME AS DONE'>
                    <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
                </MenuToggle>
                <MenuButton index={2} direction='right' label='WRITE & ADD CARD'>
                    <TimerIcon className='menu-button__icon menu-button__icon--start'/>
                </MenuButton>
                <MenuButton index={3} direction='right' label='ADD IMAGE OR GIPHY'>
                    <TimerIcon className='menu-button__icon menu-button__icon--start'/>
                </MenuButton>
                <MenuButton index={4} direction='right' label='ADD DRAWING'>
                    <TimerIcon className='menu-button__icon menu-button__icon--start'/>
                </MenuButton>
                <MenuButton index={5} direction='right' label='ADD STICKER'>
                    <TimerIcon className='menu-button__icon menu-button__icon--start'/>
                </MenuButton>
                <MenuButton index={6} direction='right' label='SETTINGS'>
                    <TimerIcon className='menu-button__icon menu-button__icon--start'/>
                </MenuButton>
            </div>
        </div>
    );
}

export default UserMenu;