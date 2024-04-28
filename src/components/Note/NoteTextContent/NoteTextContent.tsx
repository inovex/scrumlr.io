import Linkify from "linkify-react";
import "./NoteTextContent.scss";
import React from "react";

type NoteTextContentProps = {
  text: string;
};

export const NoteTextContent = ({text}: NoteTextContentProps) => {
  const linkProps = {
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      console.log("click", event.type);
    },
  };

  return (
    <Linkify
      options={{
        target: "_blank",
        className: "note-text-content--url",
        defaultProtocol: "https",
        attributes: linkProps,
      }}
    >
      {text}
    </Linkify>
  );
};
