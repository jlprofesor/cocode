import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export const PublicRoute = ({ children }: any) => {
  const { usuario } = useContext(AppContext);

  if (usuario.usuario) {
    return <Navigate to="/admin" replace={false} />;
  } else {
    return children;
  }
};
