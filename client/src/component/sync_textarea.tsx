import React from 'react';
import { Message } from '../types/message';

export default function SyncTextarea({ messages,syncTextareaVal }): JSX.Element {
  return messages.map((message: Message) => {
      syncTextareaVal.current.value = message.messageTxt
      if (message.type != 'recv') {
          return ('');
      }
  });
}