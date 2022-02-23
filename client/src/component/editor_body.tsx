import React from 'react';
import { Message } from '../types/message';

export default function EditorBody({ data,data2 }): JSX.Element {
  return data.map((message: Message, index: number) => {

      // console.log("[[[ " + objToString(data2.current))
      data2.current.value = message.message

      if (message.type != 'recv') {
          return (
              // message.message
              ''
          );
      }
  });
}

function objToString (obj) {
    return Object.entries(obj).reduce((str, [p, val]) => {
        return `${str}${p}::${val}\n`;
    }, '');
}