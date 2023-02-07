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
import { NotFoundPage } from '../pages/notFound/NotFoundPage';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const AppRouter = () => {
  const { usuario, setUsuario } = useContext(AppContext);
  const { curso, setCurso } = useContext(AppContext);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({ usuario: user.email! });
      }
    });
    getCursoActual();
  }, []);

  const getCursoActual = async () => {
    const cursos = collection(db, 'cursos');
    const q = query(cursos, where('actual', '==', true), limit(1));
    const cursoActual = await getDocs(q);
    setCurso({
      id: cursoActual.docs[0].id,
      nombre: cursoActual.docs[0].data().nombre,
      actual: true
    });
  };

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
