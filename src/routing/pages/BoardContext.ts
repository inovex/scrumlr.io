import React from 'react';

export interface BoardContextType {
  boardId?: string;
  isAdmin: boolean;
}

export const BoardContext = React.createContext<BoardContextType>({
  boardId: undefined,
  isAdmin: false,
});

export default BoardContext;
