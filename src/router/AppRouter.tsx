import { Navigate, Route, Routes } from 'react-router-dom';
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

// Sistema de rutas general de la aplicación
export const AppRouter = () => {
  // Como es lo primero que se ejecuta (lo carga el MainApp), es un buen sitio para acceder al Context y hacer comprobaciones
  // Nos traemos las funciones de cambio de usuario y de curso del Context
  const { setUsuario } = useContext(AppContext);
  const { setCurso } = useContext(AppContext);

  // Este useEffect se carga al principio, en consecuencia, cuando la aplicación se carga o se actualiza la web.
  useEffect(() => {
    // onAuthStateChanged es un método que revisa la autenticación con Firebase (como si revisara la sesión de navegación)
    onAuthStateChanged(auth, (user) => {
      // Si hay usuario autenticado
      if (user) {
        // Establecemos en el context el usuario que Firebase nos dice que tiene la sesión abierta en este navegador
        setUsuario({ nombreUsuario: user.email! });
      }
    });
    // Una vez averiguado si hay sesión abierta debemos averiguar cual es el curso actual para pasarlo al context. Es lo que hace la función getCursoActual
    getCursoActual();
  }, []);

  const getCursoActual = async () => {
    // Referenciamos la colleción de cursos mediante el método collection de Firestore
    const cursos = collection(db, 'cursos');
    // Construimos una consulta (método de Firestore query) con los cursos actual == true. De ellos cogemos el primero (limit(1)). Solo debería haber un curso actual
    const q = query(cursos, where('actual', '==', true), limit(1));
    // Con getDocs capturamos el curso
    const cursoActual = await getDocs(q);
    // Y aquí se lo pasamos al context. Pasamos el id porque ese será el que habrá que adjuntar por cada código que se agrega para establecer la relación curso/codigo y el nombre para visualizarlo en un h1
    setCurso({
      id: cursoActual.docs[0].id,
      nombre: cursoActual.docs[0].data().nombre,
      actual: true
    });
  };

  return (
    <>
      <div className="container">
        {/* Aquí se registra el sistema de rutas principal
        PublicRoute es un componente que va a determinar qué rutas son públicas. Si navegamos a la raiz del sitio o a /login cargamos LoginPage */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          {/* Si navegamos a cocode/xxxxxxx desviamos la navegación a las rutas hijas registradas en CocodeRoutes */}
          <Route path="/cocode/*" element={<CocodeRoutes />} />

          {/* PrivateRoute es un componente que va a determinar qué rutas son privadas. Si navegamos a a/dmin o a /admin/*** desviamos la navegación a las rutas hijas de AdminRoutes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />

          {/* Si ninguna ruta encaja con el mapa de rutas anterior desviamos al usuario a la página NotFoundPage */}
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
};
