import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../modules/websocket_provider';
import router from 'next/router';
import SyncTextarea from "../../component/sync_textarea";
import { Range } from 'react-range'; // 1. сначала импортируем наш компонент Range из установленного пакета
import { AuthContext } from '../../modules/auth_provider';
import { Something } from '../../types/something';
import { useGetClient } from '../../hooks/use_get_client';
import Loading from '../../component/loading';

/**
 * @see https://www.geeksforgeeks.org/how-to-add-slider-in-next-js
 *
 * NextJS — это фреймворк на основе React.
 * Он может разрабатывать красивые веб-приложения для различных платформ, таких как Windows, Linux и Mac.
 *
 * Чтобы добавить слайдер, мы воспользуемся пакетом react-range.
 * Пакет react-range помогает нам интегрировать ползунки в любое место нашего приложения.
 *
 * 1. Создать приложение NextJS, используя следующую команду:
 *    npx create-next-app gfg
 * 2. Установите необходимый пакет 'react-range', используя следующую команду:
 *    npm i react-range
 * 3. Добавление слайдера...
 */

export default function App() {
  const [messages, setMessages] = useState<Array<Something>>([]);
  const textareaVal = useRef(null); // TODO: locale Textarea
  const [rangeVal, setRangeVal] = useState({values: [0]}); // TODO: locale Range
  const syncRangeVal = useRef({values: [0]});              // TODO: sync remote Range
  const { conn, setConn } = useContext(WebSocketContext);
  const { client } = useContext(AuthContext);
  const [connStatus, setConnStatus] = useState('');

  const { clients, setClients } = useGetClient();

  useEffect(() => {
    console.log(client);

    if (conn === null) {
      router.push('/');
      return;
    }

    conn.onmessage = (msg) => { // TODO: receive remote Something(s)
      const message: Something = JSON.parse(msg.data);

      if (message.messageTxt == 'new_client') {
        setClients([...clients, { username: message.username }]);
        return;
      }
      if (message.messageTxt == 'disconnect_client') {
        const deleteClient = clients.filter((client) => client.username != message.username);
        setClients([...deleteClient]);
        return;
      }
      client.id == message.clientId ? (message.type = 'recv') : (message.type = 'self');

      setRangeVal({values: [message.messageState]});  // 2.1 после этого мы создаем состояние для хранения начального значения
      syncRangeVal.current.values = [message.messageState]; // 2.2 после этого мы создаем состояние для хранения начального значения
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
  }, [textareaVal, messages, conn, clients]);

  const sendMessage = () => {
    let data = {
      messageTxt: textareaVal.current.value,
      messageState: syncRangeVal.current.values[0]
    }
    console.log(data, '>>> send');

    conn.send( JSON.stringify(data) ); // TODO: send locale Something(s)
    // console.log('>>> ' + textarea.current.value.valueOf());
  };

  const reconnect = () => {
    if (conn == null) {
      return router.push('/');
    }
    const ws = new WebSocket(conn.url);
    if (ws.OPEN) {
      setConn(ws);
      setClients([]);
    }
  };

  if (clients === [] || conn === null) <Loading></Loading>;

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
                ref={textareaVal}
                className="w-full p-2 h-2 rounded-md bg-dark-primary focus:outline-none"
                style={{
                  backgroundColor: '#312b2b',
                  height: '780px'
                }}
                onChange={sendMessage}>
              </textarea>
              <SyncTextarea messages={messages} syncTextareaVal={textareaVal} />
            </div>

            {/* 3. затем мы добавляем наш компонент Range */}
            <br/><br/> <Range
                // 4.1 в компоненте диапазона мы устанавливаем минимальное значение, максимальное значение и текущее значение
                step={1}
                min={0}
                max={100}
                values={rangeVal.values}

                // 4.2 в компоненте диапазона мы устанавливаем функцию onChange
                onChange={
                    (values) => {
                        setRangeVal({values});
                        syncRangeVal.current.values = values;
                        sendMessage();
                    }
                }

                renderTrack={({props, children}) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '20px',
                            width: '100%',
                            backgroundColor: '#312b2b',
                            borderColor: 'green',
                            borderRadius: '5px',
                            borderWidth: 'thin'
                        }}>
                        {children}
                    </div>
                )}

                renderThumb={({props}) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            padding: '10px',
                            backgroundColor: '#312b2b',
                            borderColor: 'green',
                            borderRadius: '5px',
                            borderWidth: 'thin'
                        }}>
                        <span>{rangeVal.values} %</span>
                    </div>
                )}
            />
          </div>

        </div>
        <div className="md:w-3/12 md:visible invisible flex flex-col border-l-2 border-dark-secondary p-4">
          <div className="fixed">
            <OnCloseConnection reconnect={reconnect} message={connStatus} />
            <div className="text-lg font-bold mb-4">online</div>
            {clients.map((client, index) => (
              <div
                key={index}
                className="flex flex-row items-center h-full min-w-full ml-4"
              >
                <div className="h-3 bg-green w-3 mr-4 items-center rounded-full"></div>
                <div>{client.username}</div>
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
