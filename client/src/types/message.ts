export type Message = {
  messageTxt: string;
  messageState: number;
  clientId: number;
  username: string;
  roomId: string;
  type: 'recv' | 'self';
};
