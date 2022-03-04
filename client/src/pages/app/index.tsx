import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../modules/websocket_provider';
import router from 'next/router';
import TextareaBody from "../../component/textarea_body";
import FuncRangeBody from "../../component/range_body";
import { AuthContext } from '../../modules/auth_provider';
import { Message } from '../../types/message';
import { useGetUser } from '../../hooks/use_get_user';
import Loading from '../../component/loading';

export default function App() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const textarea = useRef(null);
  const state = {values: [0]}
  const { conn, setConn } = useContext(WebSocketContext);
  const { user } = useContext(AuthContext);
  const [connStatus, setConnStatus] = useState('');

  const { users, setUsers } = useGetUser();

  useEffect(() => {
    console.log(user);

    if (conn === null) {
      router.push('/');
      return;
    }

    conn.onmessage = (msg) => { // TODO: sync remote Message(s)
      const message: Message = JSON.parse(msg.data);

      if (message.messageTxt == 'new_user') {
        setUsers([...users, { username: message.username }]);
        return;
      }
      if (message.messageTxt == 'disconnect_user') {
        const deleteUser = users.filter((user) => user.username != message.username);
        setUsers([...deleteUser]);
        return;
      }
      user.id == message.clientId ? (message.type = 'recv') : (message.type = 'self');

      setMessages([...messages, message]);
      console.log('<<< messages:', messages)
    };

    conn.onclose = (conn) => {
      setConnStatus('disconnected');
    };

    conn.onerror = (conn) => {
      setConnStatus('connection error');
    };

    conn.onopen = (conn) => {
      setConnStatus('connected');
    };
  }, [textarea, messages, conn, users]);

  const sendMessage = () => {
    console.log('TextareaValue:', textarea.current.value, '>>> send');
    console.log('StateValue:', state.values[0], '>>> send');
    if (!textarea.current.value) return;
    conn.send( '{ "msgTxt": "' + textarea.current.value + '", "msgState": "' + state.values[0] + '" }' ); // TODO: set dynamic url-param(s)
    // console.log('>>> ' + textarea.current.value.valueOf());
  };

  const reconnect = () => {
    if (conn == null) {
      return router.push('/');
    }
    const ws = new WebSocket(conn.url);
    if (ws.OPEN) {
      setConn(ws);
      setUsers([]);
    }
  };

  if (users === [] || conn === null) <Loading></Loading>;

  return (
      <div className="flex flex-col md:flex-row w-full">
        <div className="flex flex-col w-full md:w-9/12">

          <div className="p-4 md:mx-24 mb-14">
            <div className="flex w-full mr-4 bg-dark-secondary border border-dark-secondary"
                 style={{
                   borderColor: 'green',
                   borderRadius: '5px'
                 }}>
              <textarea
                ref={textarea}
                className="w-full p-2 h-2 rounded-md bg-dark-primary focus:outline-none"
                style={{
                  backgroundColor: '#312b2b',
                  height: '780px'
                }}
                onChange={sendMessage}>
              </textarea>
            </div>
            <TextareaBody msg={messages} txt={textarea} />
            <br/><br/> <FuncRangeBody msg={messages} stateVal={state} />
          </div>

        </div>
        <div className="md:w-3/12 md:visible invisible flex flex-col border-l-2 border-dark-secondary p-4">
          <div className="fixed">
            <OnCloseConnection reconnect={reconnect} message={connStatus} />
            <div className="text-lg font-bold mb-4">online</div>
            {users.map((user, index) => (
              <div
                key={index}
                className="flex flex-row items-center h-full min-w-full ml-4"
              >
                <div className="h-3 bg-green w-3 mr-4 items-center rounded-full"></div>
                <div>{user.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export function OnCloseConnection({ reconnect, message }) {
  const disconectStyel =
    'px-4 flex flex-row justify-end w-full bg-red bg-opacity-10 text-red rounded-md';
  const connectedStyle =
    'px-4 flex flex-row justify-end w-full bg-green bg-opacity-10 text-green rounded-md';
  return (
    <div className="inline-block mb-4">
      <div
        className={
          message.includes('disconnected') ? disconectStyel : connectedStyle
        }
      >
        <div>{message}</div>
        {message.includes('disconnected') && (
          <div>
            <button
              className="px-2 ml-4 bg-dark-secondary border-red border rounded-md"
              onClick={reconnect}
            >
              reconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
