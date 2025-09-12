import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnDetails, ColumnDetailsMode} from "components/Column/ColumnDetails/ColumnDetails";
import "./ColumnHeader.scss";
import {useState, useEffect} from "react";
import {useAppSelector} from "store";

type ColumnProps = {
  column: Column;
  notesCount: number;
  isTemporary: boolean;
};

export const ColumnHeader = ({column, notesCount, isTemporary}: ColumnProps) => {
  const isModerator = useAppSelector((state) => state.participants?.self?.role === "OWNER" || state.participants?.self?.role === "MODERATOR");

  const getInitialMode = (): ColumnDetailsMode => {
    if (isTemporary) return "edit";
    return isModerator ? "moderator-view" : "view";
  };

  const [columnDetailsMode, setColumnDetailsMode] = useState<ColumnDetailsMode>(getInitialMode());

  // Update mode when moderator status changes
  useEffect(() => {
    if (!isTemporary && columnDetailsMode !== "edit") {
      const newMode = isModerator ? "moderator-view" : "view";
      if (columnDetailsMode !== newMode) {
        setColumnDetailsMode(newMode);
      }
    }
  }, [isModerator, isTemporary, columnDetailsMode]);

  return (
    <div className="column-header">
      <ColumnDetails column={column} notesCount={notesCount} mode={columnDetailsMode} changeMode={setColumnDetailsMode} isTemporary={isTemporary} />
      <NoteInput column={column} />
    </div>
  );
};
