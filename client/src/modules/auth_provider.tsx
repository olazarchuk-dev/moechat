import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/router';
import { decode } from 'punycode';
import { createContext, useEffect, useState } from 'react';
import { ClientInfo } from '../types/client_info';

export const AuthContext = createContext<{
  isAuthentcate: boolean;
  setAuthenticate: (auth: boolean) => void;
  client: ClientInfo | null;
  setClient: (client: ClientInfo) => void;
}>({
  isAuthentcate: false,
  setAuthenticate: () => {},
  client: null,
  setClient: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const router = useRouter();
  const [isAuthentcate, setAuthenticate] = useState(false);
  const [client, setClient] = useState<ClientInfo>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token'); 
    if (!token) {
      if (window.location.pathname != '/register') {
        router.push('/login');
        return;
      }
      //return;
    }

    const decode: ClientInfo = jwtDecode(token);
    if (token && decode) {
      setClient({
        email: decode.email,
        username: decode.username,
        id: decode.id,
      });
      setAuthenticate(true);
    }

  }, [isAuthentcate]);

  return (
    <>
      <AuthContext.Provider
        value={{
          isAuthentcate: isAuthentcate,
          setAuthenticate: setAuthenticate,
          client: client,
          setClient: setClient,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
