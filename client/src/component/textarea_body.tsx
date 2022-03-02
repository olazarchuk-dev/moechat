import React from 'react';
import { Message } from '../types/message';

export default function TextareaBody({ msg,txt }): JSX.Element {
  return msg.map((message: Message, index: number) => {

      // console.log("[[[ " + objToString(txt.current))
      txt.current.value = message.messageTxt

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