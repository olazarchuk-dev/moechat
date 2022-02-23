import React, { useContext, useEffect, useRef, useState } from 'react';
import autosize from 'autosize';
import { WebSocketContext } from '../../modules/websocket_provider';
import router from 'next/router';
import TextareaBody from "../../component/textarea_body";
import { AuthContext } from '../../modules/auth_provider';
import { Message } from '../../types/message';
import { useGetUser } from '../../hooks/use_get_user';
import Loading from '../../component/loading';

export default function App() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const textarea = useRef(null);
  const { conn, setConn } = useContext(WebSocketContext);
  const { user } = useContext(AuthContext);
  const [connStatus, setConnStatus] = useState('');

  const { users, setUsers } = useGetUser();

  useEffect(() => {
    autosize(textarea.current);
    console.log(user);

    if (conn === null) {
      router.push('/');
      return;
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data);
      if (m.message == 'newuser') {
        setUsers([...users, { username: m.username }]);
        return;
      }
      if (m.message == 'disconnect_user') {
        const deleteUser = users.filter((user) => user.username != m.username);
        setUsers([...deleteUser]);
        return;
      }
      user.id == m.clientId ? (m.type = 'recv') : (m.type = 'self');
      setMessages([...messages, m]);
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
    console.log(textarea.current.value, 'send');
    if (!textarea.current.value) return;
    conn.send(textarea.current.value);
    // textarea.current.value = null;
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
            <div>
              <div className="flex w-full mr-4 bg-dark-secondary">
                <textarea
                  ref={textarea}
                  className="w-full p-2 h-2 rounded-md bg-dark-primary focus:outline-none"
                  style={{
                    resize: 'none',
                  }}
                  onChange={sendMessage}>
                </textarea>
              </div>
              <TextareaBody msg={messages} txt={textarea} />
            </div>

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
