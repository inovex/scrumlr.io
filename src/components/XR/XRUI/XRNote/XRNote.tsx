import {Container, Text} from "@coconut-xr/koestlich";
import {NoteProps} from "components/Note";
import {BG_COLOR_LIGHT, FONT_COLOR} from "components/XR/xr-constants";
import {Suspense} from "react";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {Participant} from "types/participant";
import {isEqual} from "underscore";

const XRNote = (props: NoteProps) => {
  const {t} = useTranslation();

  const {note, me} = useAppSelector((state) => ({
    note: state.notes.find((n) => n.id === props.noteId),
    me: state.participants!.self,
  }));

  const authors = useAppSelector((state) => {
    const allUsers = state.participants?.others.concat(state.participants?.self);
    const noteAuthor = allUsers?.find((p) => p.user.id === note?.author);
    const childrenNoteAuthors = state.notes
      // get all notes which are in the same stack as the main note
      .filter((n) => n.position.stack === props.noteId)
      // find the corresponding author for the respective note in the list of other participants.
      .map((c) => allUsers?.find((p) => p.user.id === c.author));

    // remove undefined values (could exist if a author is not in the list of participants or hidden)
    return [noteAuthor, ...childrenNoteAuthors].filter(Boolean) as Participant[];
  }, isEqual);

  if (!note) return null;

  return (
    <Suspense>
      <Container
        flexDirection="column"
        index={note.position.rank * -1}
        backgroundColor={BG_COLOR_LIGHT}
        width="100%"
        margin={0}
        padding={12}
        backgroundOpacity={0.8}
        borderRadius={8}
        overflow="scroll"
      >
        <Text fontSize={12} color={FONT_COLOR}>
          {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
        </Text>
        <Text color={FONT_COLOR} height={64}>
          {note.text}
        </Text>
      </Container>
    </Suspense>
  );
};

export default XRNote;
