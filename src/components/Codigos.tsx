import { deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useContext } from 'react';
import { db } from '../config/firebaseConfig';
import { AppContext } from '../context/AppContext';

// Esta interface determina el tipado de la información que va a recibir el componente. En este caso, recibe los codigos de firebase
// Se decide poner aquí y no en la carpeta interfaces porque su uso va a ser exclusivo para este componente, aunque otra estrategia sería incluir todas las interfaces en la carpeta interfaces
interface IComponenteCodigosProps {
  codigos: QueryDocumentSnapshot<DocumentData>[];
  setVisibleMensajeCopy: React.Dispatch<React.SetStateAction<boolean>>;
  setMensajeCopy: React.Dispatch<React.SetStateAction<string>>;
  home: boolean;
}

// codigos son los códigos a iterar. Estos se los pasarán los componentes CocodeHistoricoPage y CocodePage
// setVisibleMensajeCopy es una función que le pasa los componentes CocodeHistoricoPage y CocodePage y que serán ejecutadas aquí al darle al botón copiar.
// La propiedad home es para ver un mensaje u otro en función de su valor. Este valor será true si el componente es llamado por CocodePage y será false si es llamado por CocodeHistoricoPage
export const Codigos = ({ codigos, setVisibleMensajeCopy, setMensajeCopy, home }: IComponenteCodigosProps) => {
  // El context maneja tanto el curso actual como el usuario actual. Si no hay usuario logueado, el usuario tendrá una porpiedad con el mismo nombre usuario con un string vacío. Si se ha logueado el administrador, tendrá el nombre de usuario del administrador
  const { usuario } = useContext(AppContext);

  // Función que ejecutará el botón Copiar de cada código. Este botón le pasa cabecera y código
  const copy = (codigo: string, cabecera: string) => {
    // Pasamos al portapapeles el código
    navigator.clipboard.writeText(codigo);
    // setMensajeCopy y setVisibleMensajeCopy son funciones que se las pasa CocodePage o CocodeHistoricoPage. Cambia respectivamente mensajeCopy y visibleMensajeCopy. Estos dos valores
    // se actualizan de forma automática en CocodePage o CocodeHistoricoPage gracias a la comunicación entre componentes
    // Pasamos el mensaje a visualizar
    setMensajeCopy(cabecera + ' copiado');
    // Ponemos visibleMensajeCopy a true para ver el mensaje
    setVisibleMensajeCopy(true);
    // y a los dos segundos (2000 milisegundos) lo ocultamos
    setTimeout(() => {
      setVisibleMensajeCopy(false);
    }, 2000);
  };

  // Función que ejecutará la eliminación de código. Esta se ejecutará cuando se pulse el botón de eliminar de uno de los códigos. Recibirá por argumente el documento (DocumentData) de Firestore (codigo)
  const deleteCodigo = async (codigo: DocumentData) => {
    if (window.confirm(`¿Estás seguro de eliminar ${codigo.data().cabecera}?`)) {
      // Firestore permite localizar un documento dentro de una colección gracias a un método llamado doc
      // doc necesita la base de datos (db) y una referencia al elemento dentro de la colección. Se especifica con la notación colección/id de documento
      // deleteDoc es otro método de Firestore que permite borrar un documento previamente capturado
      const codigoEliminar = doc(db, `codigo/${codigo.id}`);
      await deleteDoc(codigoEliminar);
    }
  };

  return (
    <>
      {/* Si no hay códigos (CocodePage o CocodeHistoricoPage le hay pasado una colección vacía porque no hay código diario o se ha elegido un día del histórico sin código) mostramos un mensaje */}
      {codigos.length === 0 && (
        // Este mensaje será diferente del valor de la propiedad home
        <div className="alert alert-warning" role="status" aria-live="polite">
          {home ? 'No hay código diario' : 'No hay código guardado en esta fecha'}
        </div>
      )}
      {/* Si hay códigos los iteramos con un map */}
      {codigos.length > 0 &&
        codigos.map((x) => {
          return (
            // x sería cada código de la colección. El id nos sirve muy bien para el key
            // Cada código será una fila (div row)
            <div className="row mt-2" key={x.id}>
              <div className="col-12" style={{ color: x.data().admin ? 'LightCoral' : 'black' }}>
                {/* Aquí va la cabecera en un h2 */}
                <h2 className="h3">
                  {x.data().cabecera} -&nbsp;
                  {/* Para poner la fecha del Timestamp que nos devuelve Firestore necesitamos esta función que extrae de la fecha la hora con dos dígitos para la hora y otros dos para los minutos */}
                  {new Date(x.data().created.toDate()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </h2>
              </div>
              <div className="col-11">
                {/* Aquí ponemos el código en un textarea con el readOnly para que no se pueda editar */}
                <textarea className="form-control" value={x.data().codigo} readOnly></textarea>
              </div>
              {/* Y por cada código generamos un botón Copiar y otro Eliminar. Ambos le pasan a las funciones copy y deleteCodigo lo que necesitan de cada código */}
              <div className="col">
                <button className="btn btn-success" onClick={() => copy(x.data().codigo, x.data().cabecera)}>
                  {/* En un span oculto a la vista se le añade la cabecera de lo que va a copiarse para que los lectures de pantalla lo lean*/}
                  Copiar <span className="visually-hidden">&nbsp;{x.data().cabecera}</span>
                </button>
                {/* El botón de eliminar solo se visualizará cuando haya un usuario logueado. Será entonces cuando usuario.nombreUsuario será diferente de un string vacío
                usuario es el objeto y nombreUsuario es la propiedad del objeto que registra el usuario. */}
                {/* {usuario.nombreUsuario !== '' && (
                  <button className="btn btn-danger" onClick={() => deleteCodigo(x)}>
                    Eliminar <span className="visually-hidden">&nbsp;{x.data().cabecera}</span>
                  </button>
                )} */}

                <button
                  className="btn btn-danger"
                  onClick={() => deleteCodigo(x)}
                  disabled={x.data().admin && usuario.nombreUsuario === ''}
                >
                  Eliminar <span className="visually-hidden">&nbsp;{x.data().cabecera}</span>
                </button>
              </div>
            </div>
          );
        })}
    </>
  );
};
