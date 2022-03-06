import React from 'react';
import { Something } from '../types/something';

export default function SyncTextarea({ somethings,syncTextareaVal }): JSX.Element {
  return somethings.map((something: Something) => {
      syncTextareaVal.current.value = something.messageTxt
      if (something.type != 'recv') {
          return ('');
      }
  });
}