import {FC, useState} from "react";
import {Actions} from "store/action";
import "./NoteDialogNoteContent.scss";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {addProtocol} from "utils/images";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import classNames from "classnames";
import {createPortal} from "react-dom";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  text: string;
  viewer: Participant;
  showNoteReactions: boolean; // used for style adjustments
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, text, viewer, showNoteReactions}: NoteDialogNoteContentProps) => {
  const [imageZoom, setImageZoom] = useState(false);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";

  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === authorId) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, isEqual);

  const onFocus = () => {
    dispatch(Actions.onNoteFocus());
  };

  const onEdit = (id: string, newText: string) => {
    if (editable && newText !== text) {
      dispatch(Actions.editNote(id, {text: newText}));
    }
    dispatch(Actions.onNoteBlur());
  };

  const isImage = useImageChecker(text);

  return (
    <div className={classNames("note-dialog__note-content", {"note-dialog__note-content--extended": !showNoteReactions})}>
      {isImage ? (
        <>
          <img
            src={addProtocol(text)}
            className={classNames("note-dialog__note-content--image")}
            alt={t("Note.userImageAlt", {user: author.isSelf ? t("Note.you") : author.displayName})}
            onClick={() => setImageZoom(!imageZoom)}
            draggable={false} // safari bugfix
          />
          {imageZoom &&
            createPortal(
              <>
                <img
                  src={addProtocol(text)}
                  className="note-dialog__note-content--image-zoom"
                  alt={t("Note.userImageAlt", {user: author.isSelf ? t("Note.you") : author.displayName})}
                  onClick={() => setImageZoom(false)}
                />
                <div className="note-dialog__note-content--image-zoom-backdrop" onClick={() => setImageZoom(false)} role="dialog" />
              </>,
              document.getElementsByClassName("stack-view")[0]!
            )}
        </>
      ) : (
        <textarea
          className="note-dialog__note-content--text"
          disabled={!editable}
          onBlur={(e) => onEdit(noteId!, e.target.value ?? "")}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          defaultValue={text}
        />
      )}
    </div>
  );
};
