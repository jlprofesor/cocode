import { signOut } from 'firebase/auth';
import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { AppContext } from '../context/AppContext';

export const Navbar = () => {
  const { usuario, setUsuario } = useContext(AppContext);
  const navigate = useNavigate();

  // Al hacer el logout, navegamos al login eliminando el historial. Esto es para no poder volver atrás
  const logout = () => {
    signOut(auth)
      .then(() => {
        setUsuario({ usuario: '' });
        navigate('/login', {
          replace: true
        });
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <nav className="navbar navbar-light bg-light navbar-expand-sm  p-2">
      <Link className="navbar-brand" to="/cocode">
        <img src="/coco.png" width="30" height="30" alt="Logo de cocode" />
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav">
          {usuario.usuario !== '' && (
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-item nav-link  ${isActive ? 'active' : ''}`} to="/admin">
                Administración
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-item nav-link  ${isActive ? 'active' : ''}`} to="/cocode/">
              Código del día
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-item nav-link  ${isActive ? 'active' : ''}`}
              to="/cocode/historico"
            >
              Histórico de código
            </NavLink>
          </li>
        </ul>
      </div>

      {usuario.usuario !== '' && (
        <div className="navbar-collapse collapse w-100 order-3 dual-collapse2 d-flex justify-content-end">
          <ul className="navbar-nav ml-auto">
            <span className="nav-item nav-link text-primary">Bienvenido, {usuario.usuario}</span>

            <button className="nav-item nav-link btn" onClick={logout}>
              Logout
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};
