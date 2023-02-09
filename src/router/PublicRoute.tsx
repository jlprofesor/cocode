import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// children representa a todos los componentes jsx que va a gestionar PrivateRoute
export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  // Extraemos del context el usuario
  const { usuario } = useContext(AppContext);

  if (usuario.nombreUsuario) {
    // Si ya hay usuario, como el único children es la página de login, desviamos al usuario a la ruta admin que carga AdminPage (no tiene sentido que vuelva a loguearse)
    return <Navigate to="/admin" replace={false} />;
  } else {
    return children;
  }
};
