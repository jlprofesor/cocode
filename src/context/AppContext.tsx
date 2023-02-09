// El context es un espacio para uso común de elementos de la aplicación. En este ejemplo, la información del usuario (usuario) es la que
// va formar parte de este espacio junto con la del curso (curso)
import { createContext } from 'react';
import { ICurso } from '../interfaces/curso.interface';
import { IUsuario, IUsuarioContext } from '../interfaces/usuario.interface';

// Comenzamos con un usuario vacío
const user: IUsuario = {
  nombreUsuario: ''
};

// Y con un curso vacío
const curso: ICurso = {
  id: '',
  nombre: '',
  actual: false
};

// Creamos el objeto que va a formar parte del context
const userContext: IUsuarioContext = {
  usuario: user,
  curso: curso,
  setUsuario: () => null,
  setCurso: () => null
};

// Y aquí creamos el context
export const AppContext = createContext<IUsuarioContext>(userContext);
