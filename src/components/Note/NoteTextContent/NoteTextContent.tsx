import React from "react";

type NoteTextContentProps = {
  text: string;
};

export const NoteTextContent = ({text}: NoteTextContentProps) => {
  const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  const parts = text.split(" ");

  // Use reduce to iterate over the parts, merging non-URLs and wrapping URLs
  const processedParts = parts.reduce<React.ReactNode[]>((acc, part, index) => {
    // Check if the part is a URL
    const isURL = urlRegex.test(part);

    // If it's a URL, push a span element onto the accumulator
    if (isURL) {
      acc.push(
        <span key={index} className="note-text-content--url">
          {part}
        </span>
      );
    } else {
      // If it's not a URL, merge it with the previous text, if the previous part is also not a URL
      if (acc.length > 0 && typeof acc[acc.length - 1] === "string") {
        acc[acc.length - 1] += ` ${part}`;
      } else {
        // If the previous part was a URL, start a new text string
        acc.push(part);
      }
    }

    return acc;
  }, []);

  const renderedText = processedParts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < processedParts.length - 1 && " "}
    </React.Fragment>
  ));

  return <>{renderedText}</>;
};
