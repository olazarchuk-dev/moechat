export type Message = {
  messageTxt: string;
  messageState: number;
  clientId: number;
  userId: string;
  username: string;
  type: 'recv' | 'self';
};
