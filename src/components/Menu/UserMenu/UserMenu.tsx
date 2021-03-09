import MenuButton from 'components/Menu/MenuItem/MenuButton';
import MenuToggle from 'components/Menu/MenuItem/MenuToggle';
import {ReactComponent as AddImageIcon} from 'assets/icon-addimage.svg';
import {ReactComponent as AddStickerIcon} from 'assets/icon-addsticker.svg';
import {ReactComponent as CheckIcon} from 'assets/icon-check.svg';
import {ReactComponent as SettingsIcon} from 'assets/icon-settings.svg';
import './UserMenu.scss';

function UserMenu() {

    return (
        <div className='user-menu'>
            <div className='user-menu__items'>
                <MenuToggle index={1} direction='right' toggleStartLabel='MARK ME AS DONE' toggleStopLabel='UNMARK ME AS DONE'>
                    <CheckIcon className='menu-item__icon menu-item__icon--start'/>
                </MenuToggle>
                <MenuButton index={2} direction='right' label='ADD IMAGE OR GIPHY'>
                    <AddImageIcon className='menu-item__icon menu-item__icon--start'/>
                </MenuButton>
                <MenuButton index={3} direction='right' label='ADD STICKER'>
                    <AddStickerIcon className='menu-item__icon menu-item__icon--start'/>
                </MenuButton>
                <MenuButton index={4} direction='right' label='SETTINGS'>
                    <SettingsIcon className='menu-item__icon menu-item__icon--start'/>
                </MenuButton>
            </div>
        </div>
    );
}

export default UserMenu;