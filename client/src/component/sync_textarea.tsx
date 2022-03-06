import React from 'react';
import { Something } from '../types/something';

export default function SyncTextarea({ messages,syncTextareaVal }): JSX.Element {
  return messages.map((message: Something) => {
      syncTextareaVal.current.value = message.messageTxt
      if (message.type != 'recv') {
          return ('');
      }
  });
}