import { FormEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { AppContext } from '../../context/AppContext';
import { ILogin } from '../../interfaces/login.interface';
import { IUsuarioContext } from '../../interfaces/usuario.interface';

export const LoginPage = () => {
  const [visibleMensajeAuthError, setVisibleMensajeAuthError] = useState<boolean>(false);
  const navigate = useNavigate();
  // Nos traemos el contexto con el usuario y la función que lo cambia
  const { setUsuario } = useContext<IUsuarioContext>(AppContext);

  const { form, onInputChange } = useForm<ILogin>({
    usuario: '',
    password: ''
  });

  const { usuario, password } = form;

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, usuario, password)
      .then((userCredential: UserCredential) => {
        // Al context no pasamos la contraseña. Por motivos de seguridad, una vez contrastadas las credenciales, su valor no se mantiene
        // userCredential viene de Firebase. Nos trae información del usuario (email, avatar...)
        setUsuario({ usuario: userCredential.user.email! });
        navigate('/admin', {
          replace: true
        });
      })
      .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        setVisibleMensajeAuthError(true);
        setTimeout(() => {
          setVisibleMensajeAuthError(false);
        }, 2000);
      });
  };

  const goToCocodePage = () => {
    navigate('cocode', {
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
          {visibleMensajeAuthError && (
            <div className="row mt-4">
              <div className="alert alert-warning" role="alert" aria-live="assertive">
                "Credenciales erróneas"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
