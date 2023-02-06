import { Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminRoutes } from '../pages/admin/AdminRoutes';
import { PrivateRoute } from './PrivateRoute';
import { useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { AppContext } from '../context/AppContext';
import { CocodeRoutes } from '../pages/cocode/CocodeRoutes';
import { PublicRoute } from './PublicRoute';
import { NotFoundPage } from '../pages/notfound/NotFoundPage';

export const AppRouter = () => {
  const { usuario, setUsuario } = useContext(AppContext);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({ usuario: user.email! });
      }
    });
  }, []);

  return (
    <>
      <div className="container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cocode/*" element={<CocodeRoutes />} />

          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />

          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
};
