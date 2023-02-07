import { ICurso } from './curso.interface';

export interface IUsuario {
  usuario: string;
}

// Esta interface determina el tipo que todos los componentes van a utilizar para gestionar el context de la aplicación
// Todos los componentes van a poder acceder al usuario (usuario) y a la función que va a permitir cambiar el usuario (setUsuario)
export interface IUsuarioContext {
  usuario: IUsuario;
  curso: ICurso;
  setUsuario: (usuario: IUsuario) => void;
  setCurso: (curso: ICurso) => void;
}
