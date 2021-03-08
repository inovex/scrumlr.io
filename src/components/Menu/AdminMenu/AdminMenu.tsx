import MenuToggle from 'components/Menu/MenuToggle/MenuToggle';
import {ReactComponent as ColumnIcon} from 'assets/icon-column.svg';
import {ReactComponent as FocusIcon} from 'assets/icon-focus.svg';
import {ReactComponent as TimerIcon} from 'assets/icon-timer.svg';
import {ReactComponent as VoteIcon} from 'assets/icon-vote.svg';
import './AdminMenu.scss';

function AdminMenu() {
    return (<div className='admin-menu'>
        <div className='admin-menu__items'>
            <MenuToggle index={1} direction='left' toggleStartLabel='START COLUMN MODE' toggleStopLabel='END COLUMN MODE'>
                <ColumnIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={2} direction='left' toggleStartLabel='START TIMER' toggleStopLabel='STOP TIMER'>
                <TimerIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={3} direction='left' toggleStartLabel='START VOTING PHASE' toggleStopLabel='END VOTING PHASE'>
                <VoteIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
            <MenuToggle index={4} direction='left' toggleStartLabel='START FOCUSED MODE' toggleStopLabel='END FOCUSED MODE'>
                <FocusIcon className='menu-toggle__icon menu-toggle__icon--start'/>
            </MenuToggle>
        </div>
    </div>);
}

export default AdminMenu;