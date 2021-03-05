import './BoardHeader.scss';
import lock from 'assets/icon-lock.svg';
import HeaderLogo from './HeaderLogo/HeaderLogo';

export interface BoardHeaderProps {
    boardstatus: String;
    name: String;
}

const BoardHeader = ({ name, boardstatus } : BoardHeaderProps) => {
    return (
        <div className="board-header">
            <HeaderLogo></HeaderLogo>
            <div className="board-header__infos">
                <p className="board-header__status">{boardstatus}</p>
                <div className="board-header__title-block">
                    <img className="board-header__status-image" src={lock} alt="Private Session"/>
                    <h1 className="board-header__title">{name}</h1>
                </div>
            </div>
            <div className="board-header__users">Placeholder User</div>
        </div>
    );
};
export default BoardHeader; 