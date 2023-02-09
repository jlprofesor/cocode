import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { AdminPage } from './AdminPage';
// Rutas hijas pertenecientes a la parte de administración
export const AdminRoutes = () => {
  return (
    <>
      {/* Mostramos el Navbar */}
      <Navbar />
      <div className="container">
        <Routes>
          {/* localhost:5173/admin o localhost:5173/admin/xxxx cargarán AdminPage */}
          <Route path="/" element={<AdminPage />} />
          <Route path="/*" element={<AdminPage />} />
        </Routes>
      </div>
    </>
  );
};
