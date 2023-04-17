import { FormEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { AppContext } from '../../context/AppContext';
import { ILogin } from '../../interfaces/login.interface';
import { IUsuarioContext } from '../../interfaces/usuario.interface';

export const LoginPage = () => {
  //useState para controlar el mensaje de error si se introducen credenciales erróneas
  const [visibleMensajeAuthError, setVisibleMensajeAuthError] = useState<boolean>(false);
  const navigate = useNavigate();
  // Nos traemos del context la función que cambia el usuario. Cuando el login sea correcto, deberemos transmitir al context que hay un usuario autenticado
  const { setUsuario } = useContext<IUsuarioContext>(AppContext);

  // Empleamos el hook useForm para gestionar el formulario de login
  const { form, onInputChange } = useForm<ILogin>({
    usuario: '',
    password: ''
  });

  const { usuario, password } = form;

  // Función de login
  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    // signInWithEmailAndPassword es una función de Firebase que permite autenticarse en una aplicaición con email/password
    // auth es nuestra configuración de autenticación extraida del archivo firebaseConfig y el usuario/password son valores del formulario
    signInWithEmailAndPassword(auth, usuario, password)
      .then((userCredential: UserCredential) => {
        // Si el login es exitoso viene la información del usuario en un objeto. Le llamamos userCredential
        // Al context le pasamos el nombre de usuario. Coincide con el email. Al final ponemos ! porque si no TypeScript nos dice que puede ser nulo. Con ! le decimos que no va a ser nulo nunca (se supone que si viene un información de un usuario autenticado, es porque hay usuario)
        setUsuario({ nombreUsuario: userCredential.user.email! });
        // Navegamos a admin si el login es exitoso. replace: true es para no permitir volver atrás (elimina el historial reciente)
        navigate('/admin', {
          replace: true
        });
      })
      .catch((error) => {
        // Si la autenticación no es exitosa sacamos el mensaje de error
        setVisibleMensajeAuthError(true);
        // Y a los 2000 milisegundos lo hacemos desaparecer
        setTimeout(() => {
          setVisibleMensajeAuthError(false);
        }, 2000);
      });
  };

  // Función que se ejecutará cuando un usuario pulse el botón de entrar como alumno. En ese caso navegamos a cocode para que cargue CocodePage tal y como se registra en el sistema de rutas de la aplicación
  const goToCocodePage = () => {
    navigate('/cocode', {
      replace: true
    });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h2 className="text-center text-dark mt-5">Bienvenido a Cocode</h2>
          <div className="text-center mb-5 text-dark">COpy my COde</div>
          <div className="card my-5">
            <form className="card-body cardbody-color p-lg-5" onSubmit={onLogin}>
              <div className="text-center">
                <img
                  src="coco.png"
                  className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3"
                  width="200px"
                  alt="logo cocode bienvenida"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="usuario">
                  Usuario
                </label>
                <input
                  className="form-control"
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={onInputChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  className="form-control"
                  id="password"
                  type="password"
                  value={password}
                  onChange={onInputChange}
                  required
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-secondary px-5 mb-5 w-100"
                  disabled={usuario.trim() === '' || password.trim() === ''}
                >
                  Iniciar sesión como administrador
                </button>
              </div>
              <div className="text-center">
                <button type="button" className="btn btn-success px-5 mb-5 w-100" onClick={goToCocodePage}>
                  Entrar como alumno
                </button>
              </div>
            </form>
          </div>
          {/* Si visibleMensajeAuthError es true se muestra el mensaje de credenciales erróneas */}
          {visibleMensajeAuthError && (
            <div className="row mt-4">
              <div className="alert alert-warning" role="status" aria-live="polite">
                Credenciales erróneas
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
