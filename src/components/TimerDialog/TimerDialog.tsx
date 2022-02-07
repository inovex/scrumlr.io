import {VFC} from "react";
import {Dialog} from "components/Dialog";
import {useNavigate} from "react-router";
import {useAppSelector} from "store";

export const TimerDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);

  return <Dialog title="Timer" onClose={() => navigate(`/board/${boardId}`)} />;
};
