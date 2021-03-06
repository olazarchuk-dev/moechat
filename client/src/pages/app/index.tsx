import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../modules/websocket_provider';
import router from 'next/router';
import SyncTextarea from "../../component/sync_textarea";
import { Range } from 'react-range'; // 1. сначала импортируем наш компонент Range из установленного пакета
import { AuthContext } from '../../modules/auth_provider';
import { Something } from '../../types/something';
import { useGetDevices } from '../../hooks/use_get_devices';
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
  const [somethings, setSomethings] = useState<Array<Something>>([]);
  const textareaVal = useRef(null); // TODO: locale Textarea
  const [rangeVal, setRangeVal] = useState({values: [0]}); // TODO: locale Range
  const syncRangeVal = useRef({values: [0]});              // TODO: sync remote Range
  const { conn, setConn } = useContext(WebSocketContext);
  const { jwtClaims } = useContext(AuthContext);
  const [connStatus, setConnStatus] = useState('');
  const { devices, setDevices } = useGetDevices();

  useEffect(() => {
    console.log(" ...app.useEffect: jwtClaims <<<", jwtClaims);

    if (conn === null) {
      router.push('/');
      return;
    }

    conn.onmessage = (some) => { // TODO: receive remote Something(s) | sync some (MessageEvent)
      const something: Something = JSON.parse(some.data);

      if (something.appTextarea == 'new_device') {
          setDevices([...devices, { deviceName: something.deviceName }]); // TODO: sync online device(s) by connected
        return;
      }
      if (something.appTextarea == 'disconnect_device') {
        const deleteDevice = devices.filter((device) => device.deviceName != something.deviceName);
        setDevices([...deleteDevice]);
        return;
      }
      jwtClaims.id == something.id ? (something.type = 'recv') : (something.type = 'self');

      setRangeVal({values: [something.appRange]});  // 2.1 после этого мы создаем состояние для хранения начального значения
      syncRangeVal.current.values = [something.appRange]; // 2.2 после этого мы создаем состояние для хранения начального значения
      setSomethings([...somethings, something]);

      console.log(' ...app.receive: somethings <<<', somethings)
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
  }, [textareaVal, somethings, conn, devices]);

  const sendSomething = () => {
    let data = {
      appTextarea: textareaVal.current.value,
      appRange: syncRangeVal.current.values[0]
    }
    console.log(' ...app.send: data (somethings) >>>', data);

    conn.send( JSON.stringify(data) ); // TODO: send locale Something(s)
  };

  const reconnect = () => {
    if (conn == null) {
      return router.push('/');
    }
    const ws = new WebSocket(conn.url);
    if (ws.OPEN) {
      setConn(ws);
      setDevices([]);
    }
  };

  if (devices === [] || conn === null) <Loading />;

  console.log(JSON.stringify(" ...app: devices <<<", devices))

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
                onChange={sendSomething}>
              </textarea>
              <SyncTextarea somethings={somethings} syncTextareaVal={textareaVal} />
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
                        sendSomething();
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
            <OnCloseConnection reconnect={reconnect} something={connStatus} />
            <div className="text-lg font-bold mb-4">online device(s)</div>
            {devices.map((device, index) => (
              <div
                key={index}
                className="flex flex-row items-center h-full min-w-full ml-4">
                <div className="h-3 bg-green w-3 mr-4 items-center rounded-full"></div>
                <div>{device.deviceName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export function OnCloseConnection({ reconnect, something }) {
  const disconectStyel =
    'px-4 flex flex-row justify-end w-full bg-red bg-opacity-10 text-red rounded-md';
  const connectedStyle =
    'px-4 flex flex-row justify-end w-full bg-green bg-opacity-10 text-green rounded-md';
  return (
    <div className="inline-block mb-4">
      <div
        className={
            something.includes('disconnected') ? disconectStyel: connectedStyle
        }
      >
        <div>{something}</div>
        {something.includes('disconnected') && (
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
