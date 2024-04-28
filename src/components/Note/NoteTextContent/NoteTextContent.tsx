import Linkify from "linkify-react";
import classNames from "classnames";
import React from "react";
import "./NoteTextContent.scss";

type NoteTextContentProps = {
  text: string;
  truncate: boolean;
};

export const NoteTextContent = (props: NoteTextContentProps) => (
  <Linkify
    options={{
      target: "_blank",
      className: classNames("note-text-content-url", {"note-text-content-url--truncate": props.truncate}),
      defaultProtocol: "https",
      attributes: {
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
        },
      },
      rel: "noopener noreferrer",
    }}
  >
    {props.text}
  </Linkify>
);
