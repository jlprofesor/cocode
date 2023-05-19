import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { CocodePage } from './CocodePage';
import { CocodeHistoricoPage } from './CocodeHistoricoPage';

// Rutas hijas pertenecientes a la parte de Cocode. Serán accesibles por los alumnos y el administrador
export const CocodeRoutes = () => {
  return (
    <>
      {/* Visualizamos la barra de navegación */}
      <Navbar />
      <div className="container">
        {/* Y especificamos el mapa de rutas: localhost:51738/cocode cargará CodcodePage, localhost:51738/historico cargará CocodeHistoricoPage y localhost:51738/cocode/xxxxx cargará CocodePage  */}
        <Routes>
          <Route path="/" element={<CocodePage />} />
          <Route path="/historico" element={<CocodeHistoricoPage />} />
          <Route path="/*" element={<CocodePage />} />
        </Routes>
      </div>
    </>
  );
};
