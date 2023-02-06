import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export const PrivateRoute = ({ children }: any) => {
  const { usuario } = useContext(AppContext);

  if (!usuario.usuario) {
    return <Navigate to="/login" replace={false} />;
  } else {
    return children;
  }
};
