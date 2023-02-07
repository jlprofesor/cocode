import { useForm } from '../../hooks/useForm';
import { db } from '../../config/firebaseConfig';
import { FormEvent, useContext, useState } from 'react';
import { collection, DocumentData, getDocs, orderBy, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { Codigos } from '../../components/Codigos';
import { IFormFecha } from '../../interfaces/formFecha.interface';
import { AppContext } from '../../context/AppContext';

export const CocodeHistoricoPage = () => {
  const { curso } = useContext(AppContext);
  const [visibleMensajeCopy, setVisibleMensajeCopy] = useState<boolean>(false);
  const [mensajeNoCodigo, setMensajeNoCodigo] = useState<boolean>(false);
  const [mensajeCopy, setMensajeCopy] = useState<string>('');
  const [codigos, setCodigos] = useState<QueryDocumentSnapshot<DocumentData>[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const beep2 = new Audio(
    'data:audio/mpeg;base64,/+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
  );

  // Llamada al hook useForm para gestionar el formulario
  const { form, onInputChange } = useForm<IFormFecha>({
    fecha: new Date().toISOString().split('T')[0]
  });

  const { fecha } = form;

  const getCodigos = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);
    const q = query(
      collection(db, 'codigo'),
      where('created', '>=', start),
      where('created', '<=', end),
      where('curso', '==', curso.id),
      orderBy('created', 'asc')
    );
    const codigos = await getDocs(q);
    // getDocs es una función de Firebase que trae los datos de una colección (collection), de nuestra base de datos (db), que se llama codigos
    // Pasamos a los productos que va a pintar la tabla los docs. docs también es algo de Firebase. De la colección que hemos conseguido en la línea anterior, extraemos los docs, es decir, los documentos, en nuestro caso los productos
    setCodigos(codigos.docs);
    setLoading(false);
    setMensajeNoCodigo(codigos.docs.length === 0);
  };

  const downloadTextFile = () => {
    let codigo: string = '';
    codigos?.forEach((x) => {
      codigo += `// ${x.data().cabecera} - ${new Date(x.data().created.toDate()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      codigo += '\n';
      x.data().codigo;
      codigo += x.data().codigo;
      codigo += '\n';
      codigo += '\n';
      codigo += '****************************************';
      codigo += '\n';
      codigo += '\n';
    });

    const blob = new Blob([codigo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `codigo_${fecha}.txt`;
    link.href = url;
    link.click();
    beep2.play();
  };

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <h1>Cocode histórico</h1>
          <hr />
          <h2>Curso: {curso.nombre}</h2>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col">
          <form onSubmit={getCodigos}>
            <div className="form-group">
              <label className="form-label" htmlFor="fecha">
                Fecha
              </label>
              <input className="form-control" type="date" id="fecha" value={fecha} onChange={onInputChange} required />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Consultar código
            </button>
          </form>
        </div>
      </div>
      {codigos && !mensajeNoCodigo && !loading && (
        <button type="button" className="btn btn-success mt-2" onClick={downloadTextFile}>
          Descargar archivo txt con el código
        </button>
      )}
      {visibleMensajeCopy && (
        <div className="row mt-4">
          <div className="alert alert-warning" role="alert" aria-live="assertive">
            {mensajeCopy}
          </div>
        </div>
      )}
      <div className="row my-4 vertical-scrollable">
        <div className="col">
          {codigos && (
            <Codigos
              codigos={codigos}
              setVisibleMensajeCopy={setVisibleMensajeCopy}
              setMensajeCopy={setMensajeCopy}
              home={false}
            />
          )}
        </div>
      </div>
    </>
  );
};
