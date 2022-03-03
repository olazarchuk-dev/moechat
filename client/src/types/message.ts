export type Message = {
  messageTxt: string;
  messageState: string;
  clientId: number;
  username: string;
  roomId: string;
  type: 'recv' | 'self';
};
