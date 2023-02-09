import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// children representa a todos los componentes jsx que va a gestionar PrivateRoute
export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  // PrivateRoute extrae del context el usuario
  const { usuario } = useContext(AppContext);

  // Si no hay usuario, señal de que quien está entrando no tiene permisos, luego le redireccionamos a login
  if (!usuario.nombreUsuario) {
    return <Navigate to="/login" replace={false} />;
  } else {
    // Si hay usuario devolvemos el propio componente al que el usuario está pretendiendo entrar
    return children;
  }
};
