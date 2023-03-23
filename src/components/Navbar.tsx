import { signOut } from 'firebase/auth';
import { ChangeEvent, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { AppContext } from '../context/AppContext';

// Componente barra de navegación
export const Navbar = () => {
  // Obtenemos del context, el usuario y la función que nos va a permitir cambiarlo. Cuando cerremos sesión desde aquí, el usuario desaparecerá.
  const { usuario, setUsuario } = useContext(AppContext);
  const { beep, setBeep } = useContext(AppContext);

  const navigate = useNavigate();
  // Al hacer el logout, navegamos al login eliminando el historial. Esto es para no poder volver atrás
  const logout = () => {
    // signOut forma parte del módulo de autenticación de Firebase. auth está importado arriba y es la capacidad de autenticación con Firebase de nuestro proyecto.
    // Está importado desde el archivo de configuración de Firebase
    signOut(auth)
      .then(() => {
        // Cuando hemos cerrado sesión vaciamos el nombre del usuario. setUsuario es la función que va al context a cambiar el usuario. Así toda la aplicación podrá saber que el usuario está vacío
        setUsuario({ nombreUsuario: '' });
        // Navegamos a login eliminando el historial reciente para no volver atrás
        navigate('/login', {
          replace: true
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleBeep = (e: ChangeEvent<HTMLInputElement>) => {
    setBeep({ audio: e.target.checked });
  };

  return (
    // Cada enlace va a una página. Las rutas (to="/xxxxxx") tienen que tener su igual en el sistema de rutas de la aplicación. Este sistema de rutas está en los archivos de enrutamiento de la carpeta router, el AdminRoutes y en CocodeRoutes
    <nav className="navbar navbar-light bg-light navbar-expand-sm  p-2">
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      {/* Link y NavLink permiten navegar a diferentes sitios de la aplicación. Esos sitios serán accesibles mediante las rutas. NavLink tiene propiedades que Link no tiene y que, por ejemplo, nos van a permitir activar el enlace de la página en la que estamos */}
      <Link className="navbar-brand" to="/cocode">
        <img src="/coco.png" width="30" height="30" alt="Logo de cocode" />
      </Link>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav">
          {/* El link de Administración solo estará visible para el administrador. Este se habrá autenticado previamente y tendrá nombreUsuario registrado en el context. */}
          {usuario.nombreUsuario !== '' && (
            <li className="nav-item">
              {/* isActive es una de las propiedades que NavLink recibe en un objeto. Al desestructurar podemos obtenerla. Si el link es el que representa a la página que se está viendo le aplicamos la clase de Bootstrap active */}
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
      {/* Como ocurre con el link de Administración, este área de cerrar sesión y de bienvenida solo estará visible para el administrador excepto la personalización de sonidos. Este se habrá autenticado previamente y tendrá nombreUsuario registrado en el context.  */}
      <div className="navbar-collapse collapse w-100 order-3 dual-collapse2 d-flex justify-content-end">
        <ul className="navbar-nav ml-auto">
          {/* <li className="nav-item">
            <span className="nav-item nav-link">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={beep.audio}
                  id="checkBeep"
                  onChange={toggleBeep}
                />
                <label className="form-check-label" htmlFor="checkBeep">
                  Emitir sonidos
                </label>
              </div>
            </span>
          </li> */}
          {/* Mostramos en un span el nombre de usuario. Este está representado en la propiedad nombreUsuario dentro del objeto usuario importado desde el context */}
          {usuario.nombreUsuario !== '' && (
            <span className="nav-item nav-link text-primary">Bienvenido, {usuario.nombreUsuario}</span>
          )}
          {/* Y aquí el botón cerrar sesión que ejecuta la función logout */}
          {usuario.nombreUsuario !== '' && (
            <button className="nav-item nav-link btn" onClick={logout}>
              Cerrar sesión
            </button>
          )}
        </ul>
      </div>
    </nav>
  );
};
