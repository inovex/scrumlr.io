'use strict';
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Input file must be specified');
  process.exit(1);
}

const inputFile = args[0];
let rawdata = fs.readFileSync(inputFile);
let data = JSON.parse(rawdata);

let invalidNumer = 0;

let output = "date;users;cards;phase;mode;secure;showAuthor\n";
Object.keys(data.boards).forEach((key) => {

  const board = data.boards[key];


  if (!!board.private && !!board.private.config && !!board.private.config.created && !!board.private.cards && !!board.public && !!board.public.config) {
    const createdDate = new Date(board.private.config.created);
    const date = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()}`;

    const cards = Object.keys(board.private.cards).length;
    const users = Object.keys(board.private.users).length;
    const phase = board.private.config.guidedPhase;
    const secure = board.public.config.secure ? 1 : 0;
    const mode = board.private.config.mode;
    const showAuthor = board.private.config.showAuthor ? 1 : 0;

    output += `${date};${users};${cards};${phase};${mode};${secure};${showAuthor}\n`;
  } else {
    invalidNumer++;
  }
});

fs.writeFileSync('./stats.csv', output);
console.log(`${invalidNumer} invalid boards detected`);