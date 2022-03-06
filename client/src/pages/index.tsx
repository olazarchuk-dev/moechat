import { getUserService } from '../service/get_users';
import Loading from '../component/loading';
import { useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createUserService } from '../service/create_user';
import { WEBSOCKET_URL } from '../constants';
import { WebSocketContext } from '../modules/websocket_provider';
import router from 'next/router';
import { AuthContext } from '../modules/auth_provider';
import jwtDecode from 'jwt-decode';
import { ClientInfo } from '../types/client_info';

export default function Index() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const { setConn } = useContext(WebSocketContext);
  const { client, setClient } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const res = await getUserService();
      if (res.data.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.log(err);
      setMessage('something wrong when getting users');
    }
  };

  useEffect(() => {
    getUsers();
    const token = localStorage.getItem('access_token');
    if (token) {
      const jwt: ClientInfo = jwtDecode(token);
      setClient(jwt);
    }
  }, []);

  const submit = async () => {
    try {
      setUserName('');
      const res = await createUserService({
        userId: uuidv4(),
        roomName: userName,
      });
      if (res.data) {
        getUsers();
      }
    } catch (err) {
      console.log(err);
      setMessage('something wrong');
    }
  };

  const joinUser = (userId: string) => {
    const ws = new WebSocket(
      `${WEBSOCKET_URL}/${userId}?clientId=${client.id}&username=${client.username}` // TODO: set static url-param(s)
    );
    if (ws.OPEN) {
      setConn(ws);
      router.push('/app');
    }
  };

  const onUserChange = (e) => {
    const value = e.target.value;
    setUserName(value);
  };

  if (users === [] || client === null) return <Loading />;

  return (
    <>
      <div className="my-8 px-4 md:mx-32 h-full w-full">
        <div className="flex justify-center">
          <div className="w-96 rounded-md bg-dark-secondary">
            <div className="mt-3 text-center">
              {message && (
                <div className="mb-3 bg-red bg-opacity-10 p-2 rounded-md text-red">
                  {message}
                </div>
              )}
              <input
                type="text"
                className="p-2 bg-dark-primary border border-green rounded-md focus:outline-none"
                placeholder="username"
                onChange={onUserChange}
              />
              <button
                className="bg-dark-primary mt-4 md:mt-0 border border-green text-green rounded-md p-2 md:ml-4"
                onClick={submit}>
                connect
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="font-bold">join to user</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {users.map((user, index) => (
              <div
                key={index}
                className="bg-dark-secondary p-4 flex flex-row rounded-md w-full"
              >
                <div className="w-full">
                  <div className="text-sm">username</div>
                  <div className="text-yellow font-bold text-lg">
                    {user.roomName}
                  </div>
                </div>
                <div className="inline-block">
                  <button
                    className="bg-dark-primary px-4 text-yellow border border-yellow rounded-md"
                    onClick={() => joinUser(user.userId)}
                  >
                    join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
