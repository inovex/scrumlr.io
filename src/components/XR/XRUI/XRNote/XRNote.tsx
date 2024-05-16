import {NoteProps} from "components/Note";
import {FONT_COLOR} from "components/XR/xr-constants";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {Participant} from "types/participant";
import {isEqual} from "underscore";
import {Text} from "@react-three/uikit";
import {Card} from "components/apfel/card";

const XRNote = (props: NoteProps) => {
  const {t} = useTranslation();

  const {note, me} = useAppSelector((state) => ({
    note: state.notes.find((n) => n.id === props.noteId),
    me: state.participants!.self,
  }));

  const authors = useAppSelector((state) => {
    const allUsers = state.participants?.others.concat(state.participants?.self);
    const noteAuthor = allUsers?.find((p) => p.user.id === note?.author);
    const childrenNoteAuthors = state.notes.filter((n) => n.position.stack === props.noteId).map((c) => allUsers?.find((p) => p.user.id === c.author));

    return [noteAuthor, ...childrenNoteAuthors].filter(Boolean) as Participant[];
  }, isEqual);

  if (!note) return null;

  return (
    <Card borderRadius={16} transformTranslateZ={8} flexDirection="column" width="100%" height={96} padding={12} overflow="scroll" gap={4} scrollbarWidth={0}>
      <Text fontSize={12} color={FONT_COLOR} marginBottom={0}>
        {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
      </Text>
      <Text color={FONT_COLOR} fontSize={14} height="100%" wordBreak="break-all" verticalAlign="top">
        {note.text}
      </Text>
    </Card>
  );
};

export default XRNote;
