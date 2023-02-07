import { deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useContext } from 'react';
import { db } from '../config/firebaseConfig';
import { AppContext } from '../context/AppContext';

// Esta interface determina el tipado de la información que va a recibir el componente. En este caso, recibe los codigos de firebase

// Se decide poner aquí y no en la carpeta interfaces porque su uso va a ser exclusivo para este componente
interface IComponenteCodigosProps {
  codigos: QueryDocumentSnapshot<DocumentData>[];
  setVisibleMensajeCopy?: React.Dispatch<React.SetStateAction<boolean>>;
  setMensajeCopy?: React.Dispatch<React.SetStateAction<string>>;
  home: boolean;
}

// El componente recibe los países y los renderiza
export const Codigos = ({ codigos, setVisibleMensajeCopy, setMensajeCopy, home }: IComponenteCodigosProps) => {
  const { usuario } = useContext(AppContext);
  const copy = (codigo: string, cabecera: string) => {
    navigator.clipboard.writeText(codigo);
    setMensajeCopy && setMensajeCopy(cabecera + ' copiado');
    setVisibleMensajeCopy && setVisibleMensajeCopy(true);
    setTimeout(() => {
      setVisibleMensajeCopy && setVisibleMensajeCopy(false);
    }, 2000);
  };

  const deleteCodigo = async (codigo: DocumentData) => {
    if (window.confirm(`¿Estás seguro de eliminar ${codigo.data().cabecera}?`)) {
      const codigoEliminar = doc(db, `codigo/${codigo.id}`);
      await deleteDoc(codigoEliminar);
    }
  };

  return (
    <>
      {codigos.length === 0 && (
        <div className="alert alert-warning" role="alert" aria-live="assertive">
          {home ? 'No hay código diario' : 'No hay código guardado en esta fecha'}
        </div>
      )}
      {codigos.length > 0 &&
        codigos.map((x, i) => {
          return (
            <div className="row mt-2" key={x.id}>
              <div className="col-12">
                <h2 className="h3">
                  {x.data().cabecera} -&nbsp;
                  {new Date(x.data().created.toDate()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </h2>
              </div>
              <div className="col-11">
                <textarea className="form-control" value={x.data().codigo} readOnly></textarea>
              </div>
              <div className="col">
                <button className="btn btn-success" onClick={() => copy(x.data().codigo, x.data().cabecera)}>
                  Copiar <span className="visually-hidden">&nbsp;{x.data().cabecera}</span>
                </button>
                {usuario.usuario !== '' && (
                  <button className="btn btn-danger" onClick={() => deleteCodigo(x)}>
                    Eliminar <span className="visually-hidden">&nbsp;{x.data().cabecera}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </>
  );
};
