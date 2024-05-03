import Linkify from "linkify-react";
import classNames from "classnames";
import {addProtocol} from "utils/images";
import "./NoteTextContent.scss";

type NoteTextContentProps = {
  text: string;
  truncate?: boolean;
};

export const NoteTextContent = (props: NoteTextContentProps) => {
  // render a link, opening in a new tab.
  // this functionality could also be extended,
  // e.g. you could add wrappers for other scrumlr links etc.
  const renderLink = (content: {content: string}) => {
    const url = addProtocol(content.content);
    return (
      <a
        href={url}
        title={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames("note-text-content-url", {"note-text-content-url--truncate": props.truncate})}
        onClick={(e) => e.stopPropagation()}
      >
        {content.content}
      </a>
    );
  };

  return (
    <Linkify
      options={{
        render: renderLink,
      }}
    >
      {props.text}
    </Linkify>
  );
};
