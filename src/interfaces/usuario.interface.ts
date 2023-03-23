import { IBeep } from './beep.interface';
import { ICurso } from './curso.interface';

// Esta interface da tipo al usuario que gestionará el context. Podríamos evitarla y utilizar como usuario un string, pero por si incorporamos más información del usuario en el futuro (avatar, rol...), mejor así.
export interface IUsuario {
  nombreUsuario: string;
}

// Esta interface determina el tipo que todos los componentes van a utilizar para gestionar el context de la aplicación
// Todos los componentes van a poder acceder al usuario (usuario) y a la función que va a permitir cambiar el usuario (setUsuario)
// También al curso (curso) y a la función que va a permitir cambiar el curso (setCurso)
export interface IUsuarioContext {
  usuario: IUsuario;
  curso: ICurso;
  beep: IBeep;
  setUsuario: (usuario: IUsuario) => void;
  setCurso: (curso: ICurso) => void;
  setBeep: (beep: IBeep) => void;
}
