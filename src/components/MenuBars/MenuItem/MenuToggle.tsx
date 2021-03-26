import { useEffect, useRef, useState } from 'react';
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import classNames from 'classnames';
import './MenuItem.scss';

type MenuToggleProps = {
    direction: 'left' | 'right';
    onToggle: (active: boolean) => void;
    toggleStartLabel: string;
    toggleStopLabel: string;
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

function MenuToggle(props: MenuToggleProps) {

    const [isActive, setStatus] = useState(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!isFirstRender.current) {
            props.onToggle(isActive);
        }
    }, [isActive]);

    useEffect(() => {
        isFirstRender.current = false;
    })

    const Icon = props.icon;

    return (<button 
                className={classNames('menu-item', {'menu-item--active': isActive, 'menu-item--disabled': !isActive}, `menu-item--${props.direction}`)}
                onClick={() => setStatus(prevValue => !prevValue)}
            >
        <div className='menu-item__tooltip'>
            <span className='tooltip__text'>
                {isActive ? props.toggleStopLabel : props.toggleStartLabel}
            </span>
        </div>
        <Icon className='menu-item__icon menu-item__icon--start'/>
        <CloseIcon className='menu-item__icon menu-item__icon--end'/>
    </button>);
}

export default MenuToggle;