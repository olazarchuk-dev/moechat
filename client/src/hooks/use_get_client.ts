import router from 'next/router';
import { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../modules/websocket_provider';
import { getClientsInUser } from '../service/app'

export const useGetClient = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const { conn } = useContext(WebSocketContext)
  

  useEffect(() => {
    console.log(clients)
    if (conn === null){
      router.push('/')
      return
    }
    const url = conn.url
    const userId = url.split('/')
    getClientsInUser(userId[4])
      .then((res) => {
        console.log(res.data);
        setClients(res.data.data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return { clients: clients, error, setClients: setClients };
};
