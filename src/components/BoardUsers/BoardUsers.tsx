import React from 'react';
// import { useSelector } from 'react-redux';
// import { ApplicationState } from 'types/store';
import BoardUser from './BoardUser';
import RestUserCounter from './RestUsersCounter';
import './BoardUsers.scss';
import Parse from 'parse';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'types/store';

export interface BoardUsersProps {
  numOfUsersToShow: number;
}

const BoardUsers = ({ numOfUsersToShow }: BoardUsersProps) => {
  const users = useSelector((state: ApplicationState) => state.users.all);
  const currentUser = Parse.User.current();

  const me = users.find(user => user.id === currentUser!.id);
  const connectedUsers = users.filter(user => user.online);
  const them = connectedUsers.filter(user => user.id !== currentUser!.id);
  const usersToShow = them.splice(0, (them.length > numOfUsersToShow ? numOfUsersToShow - 1 : numOfUsersToShow));

  return (
    <div className="users">
      <ul className="user-list">
        {them.length > 0 && <RestUserCounter count={them.length} />}
        {usersToShow.map((user, i) => <BoardUser key={i} id={user.id} name={user.displayName} />)}
        {!!me && <BoardUser id={me.id} name={me.displayName} />}
      </ul>
    </div>
  );
};

export default BoardUsers;