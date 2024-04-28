import Linkify from "linkify-react";
import "./NoteTextContent.scss";
import React from "react";

type NoteTextContentProps = {
  text: string;
};

export const NoteTextContent = ({text}: NoteTextContentProps) => (
  <Linkify
    options={{
      target: "_blank",
      className: "note-text-content--url",
      defaultProtocol: "https",
      attributes: {
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
        },
      },
      rel: "noopener noreferrer",
    }}
  >
    {text}
  </Linkify>
);
