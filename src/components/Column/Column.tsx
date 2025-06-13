import _ from "underscore";
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {useAppSelector} from "store";
import {Color, getColorClassName} from "constants/colors";
import {Droppable} from "components/DragAndDrop/Droppable";
import {Note} from "components/Note";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import "./Column.scss";
import {ColumnHeader} from "components/Column/ColumnHeader/ColumnHeader";
import {TEMPORARY_COLUMN_ID} from "constants/misc";

export interface ColumnProps {
  id: string;
  name: string;
  description: string;
  color: Color;
  visible: boolean;
  index: number;
}

export const Column = ({id, name, description, color, visible, index}: ColumnProps) => {
  // const {isTextTruncated, textRef} = useTextOverflow<HTMLHeadingElement>(name);

  const isTemporary = id === TEMPORARY_COLUMN_ID;

  const notes = useAppSelector(
    (state) =>
      state.notes
        ? state.notes
            .filter((note) => !note.position.stack)
            .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === id)
            .map((note) => note.id)
        : [],
    _.isEqual
  );
  const moderating = useAppSelector((state) => state.view.moderating);
  const viewer = useAppSelector((state) => state.participants!.self);

  const colorClassName = getColorClassName(color);
  const isModerator = viewer?.role === "OWNER" || viewer?.role === "MODERATOR";
  // const {value: columnName, ...emoji} = useEmojiAutocomplete<HTMLDivElement>({maxInputLength: 32, initialValue: name});

  const columnRef = useRef<HTMLElement | null>(null);
  const [localNotes, setLocalNotes] = useState(notes);
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const setItems = (items: string[]) => {
    setLocalNotes(items);
  };
  const {
    bindings: {ref: stripeRef, style: stripeStyle},
    updateOffset,
  } = useStripeOffset({gradientLength: 40, gradientAngle: 45});

  const columnCount = useAppSelector((state) => state.columns.length);

  useEffect(() => {
    updateOffset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount]);

  return (
    <section
      className={classNames("column", {"column--hidden": !visible}, {"column__moderation-isActive": isModerator && moderating}, colorClassName)}
      style={stripeStyle}
      ref={(r) => {
        columnRef.current = r;
        stripeRef.current = r;
      }}
    >
      <div className="column__content">
        <ColumnHeader column={{id, index, name, color, visible, description}} notesCount={localNotes.length} isTemporary={isTemporary} />
        <Droppable id={id} items={localNotes} setItems={setItems} globalNotes={notes} className="column__notes-wrapper">
          <ul className="column__note-list">
            {localNotes.map((note) => (
              <li key={note}>
                <Note setItems={setItems} noteId={note} viewer={viewer} colorClassName={colorClassName} />
              </li>
            ))}
          </ul>
        </Droppable>
      </div>
    </section>
  );
};
