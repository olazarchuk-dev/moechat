import router from 'next/router';
import { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../modules/websocket_provider';
import { getDevicesInUser } from '../service/get_devices_in_user'

export const useGetDevices = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const { conn } = useContext(WebSocketContext)
  

  useEffect(() => {
    console.log(devices)
    if (conn === null){
      router.push('/')
      return
    }
    const url = conn.url
    const username = url.split('/')
    getDevicesInUser(username[4])
        .then((res) => {
          console.log(res.data);
          setDevices(res.data.data);
        })
        .catch((err) => {
          setError(err.message);
        });
  }, []);

  return { devices: devices, error, setDevices: setDevices };
};
