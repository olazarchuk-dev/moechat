export type Message = {
  messageTxt: string;
  clientId: number;
  username: string;
  roomId: string;
  type: 'recv' | 'self';
};
