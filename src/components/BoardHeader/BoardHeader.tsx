import React from 'react';
import './BoardHeader.scss';
import logo from 'assets/logo-scrumlr-on-dark.svg';
import lock from 'assets/icon-lock.svg';

export interface BoardHeaderProps {
    boardstatus: String;
    name: String;
}

const BoardHeader = ({ name, boardstatus } : BoardHeaderProps) => {
    return (
        <div className="board-header">
            <img className="board-header__logo" src={logo} alt="Logo"/>
            <div className="board-header__infos">
                <p className="board-header__status">{boardstatus}</p>
                <img className="board-header__status-image" src={lock} alt="Closed"/>
                <h1 className="board-header__title">{name}</h1>
            </div>
            <div className="board-header__users">Placeholder User</div>
        </div>
    );
};
export default BoardHeader; 