import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";
import {ColumnSettings} from "components/Column/ColumnSettings";
import {useState} from "react";
import classNames from "classnames";
import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
  notesCount: number;
};

export const ColumnHeader = ({column, notesCount}: ColumnProps) => (
    <div className="column-header">
      <ColumnNameDetails column={column} notesCount={notesCount} />
      <NoteInput column={column} />
    </div>
  );
