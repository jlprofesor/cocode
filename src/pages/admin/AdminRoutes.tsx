import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { AdminPage } from './AdminPage';

export const AdminRoutes = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<AdminPage />} />
          <Route path="/*" element={<AdminPage />} />
        </Routes>
      </div>
    </>
  );
};
