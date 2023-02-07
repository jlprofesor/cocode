import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { CocodePage } from './CocodePage';
import { CocodeHistoricoPage } from './CocodeHistoricoPage';

export const CocodeRoutes = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<CocodePage />} />
          <Route path="/historico" element={<CocodeHistoricoPage />} />
          <Route path="/*" element={<CocodePage />} />
        </Routes>
      </div>
    </>
  );
};
