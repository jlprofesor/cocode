import { useForm } from '../../hooks/useForm';
import { db } from '../../config/firebaseConfig';
import { FormEvent, useContext, useState } from 'react';
import { collection, DocumentData, getDocs, orderBy, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { Codigos } from '../../components/Codigos';
import { IFormFecha } from '../../interfaces/formFecha.interface';
import { AppContext } from '../../context/AppContext';

export const CocodeHistoricoPage = () => {
  // Extraemos del context el curso actual
  const { curso } = useContext(AppContext);
  const { beep } = useContext(AppContext);
  // useState para controlar si el mensaje de aviso de texto copiado está visible o no. En este componente, visibleMensajeCopy se utiliza para ver o no ver el mensaje de texto copiado
  // setVisibleMensajeCopy se le pasará al componente Codigos porque desde ese componente entrará en acción al pulsar el botón copiar de cada código.
  const [visibleMensajeCopy, setVisibleMensajeCopy] = useState<boolean>(false);
  // useState para controlar el contenido del mensaje cuando se le pulsa al botón copiar. En este componente se utiliza para mostrar el mensaje. Al igual que le useState anterior, se le pasa
  // al componente Codigos setMensajeCopy porque desde ese componente entrará en acción cuando se construya el mensaje al pulsar el botón copiar de cada código.
  const [mensajeCopy, setMensajeCopy] = useState<string>('');
  // useState para controlar si hay código del día seleccionado en el calendario o no
  const [mensajeNoCodigo, setMensajeNoCodigo] = useState<boolean>(false);
  // En el histórico no necesitamos una suscripción en tiempo real a los datos, solo una consulta cada vez que elijamos una fecha y pulsemos el botón de descarga
  // Una vez obtenidos los códigos, este useState los actualizará para renderizarlos
  const [codigos, setCodigos] = useState<QueryDocumentSnapshot<DocumentData>[] | null>(null);
  // useState para gestionar cuándo se están cargando los documentos. Lo utilizaremos para el mensaje Cargando códigos
  const [loading, setLoading] = useState<boolean>(false);

  // Audio que sonará cuando se descargue el archivo de código
  const beep2 = new Audio(
    'data:audio/mpeg;base64,/+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
  );

  // Llamada al hook useForm para gestionar el formulario. Este formulario solo consta de la fecha.
  const { form, onInputChange } = useForm<IFormFecha>({
    fecha: new Date().toISOString().split('T')[0]
  });

  const { fecha } = form;

  // Función que ejecutará el submit del formulario
  const getCodigos = async (e: FormEvent) => {
    e.preventDefault();
    // Ponemos el loading a true para gestionar la aparición del mensaje
    setLoading(true);
    // start y end son las fechas desde/hasta las que queremos recibir el código
    // Queremos recibir el código de hoy (new Date()), desde las 0:0:0 hasta las 23:59
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);
    // query permite construir una consulta en Firestore
    // En este caso, de la colección código de la base de datos obtenemos los códigos que tienen el id del curso actual, entre las dos fechas, ordenados de forma ascendente
    const q = query(
      collection(db, 'codigo'),
      where('created', '>=', start),
      where('created', '<=', end),
      where('curso', '==', curso.id),
      orderBy('created', 'asc')
    );
    // getDocs es una función de Firestore que trae los datos de una consulta (q)
    const codigos = await getDocs(q);
    // Pasamos a los productos que va a renderizar la tabla los docs. docs también es algo de Firebase. De la colección que hemos conseguido en la línea anterior, extraemos los docs, es decir, los documentos, en nuestro caso los códigos
    setCodigos(codigos.docs);
    // Ponemos el loading a true para gestionar la aparición del mensaje
    setLoading(false);
    // codigos.docs.length === 0 devolverá true o false dependiendo de si vienen códigos o no
    // Ese será el valor que pasaremos al booleano mensajeNoCodigo para gestionar la aparición del mensaje que notifica la ausencia de códigos del día
    setMensajeNoCodigo(codigos.docs.length === 0);
  };

  // Función que descarga el archivo de texto
  const downloadTextFile = () => {
    let codigo: string = '';
    // Iteramos los códigos. Como codigos puede que no tenga nada, TypeScript da error de compilación.
    // Con el ? ejecutará el forEach si no es nulo. Cada código será x
    codigos?.forEach((x) => {
      // Por cada código ponemos la cabecera y la hora precedido de //
      codigo += `// ${x.data().cabecera} - ${new Date(x.data().created.toDate()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      // Cada '\n' es un salto de línea. Vamos concatenando saltos de línea, el código y los asteriscos separadores
      codigo += '\n';
      codigo += x.data().codigo;
      codigo += '\n';
      codigo += '\n';
      codigo += '****************************************';
      codigo += '\n';
      codigo += '\n';
    });

    // Y ahora descargamos el archivo. Creamos un Blob, que viene a ser algo así como un buffer de información
    // de tipo texto
    const blob = new Blob([codigo], { type: 'text/plain' });
    // Y ahora utilizamos una técnica que se suele utilizar para provocar la descarga del archivo.
    // Creamos una url artificial que apunta al blob anterior
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // Le damos un nombre a la descarga
    link.download = `codigo_${fecha}.txt`;
    link.href = url;
    // Este click produce la descarga de la misma manera que cuando hacemos clic en un enlace de descarga de archivos
    link.click();
    // Hacemos sonar el beep de la descarga
    beep.audio && beep2.play();
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
      {/* Si no hay códigos y ha terminado la consulta (!loading) sacamos el mensaje */}
      {!mensajeNoCodigo && !loading && (
        <button type="button" className="btn btn-success mt-2" onClick={downloadTextFile}>
          Descargar archivo txt con el código
        </button>
      )}
      {/* El componente Codigos, mediante la función setVisibleMensajeCopy que se le pasa, cambia el booleano visibleMensajeCopy*
      También cambia mensajeCopy gracias a la función setMensajeCopy*/}
      {visibleMensajeCopy && (
        <div className="row mt-4">
          <div className="alert alert-warning" role="status" aria-live="polite">
            {mensajeCopy}
          </div>
        </div>
      )}
      <div className="row my-4 vertical-scrollable">
        <div className="col">
          {/* Si hay códigos, estos se pasan a un componente Codigos que los va a renderizar. Lo he hecho en un componente para reutilizarlo en CocodeHistoricoPage
          le pasamos por propiedad los codigos, la función que va a cambiar el booleano para ver o no ver el mensaje cuando le demos al botón copiar y el mensaje que debe mostar al darle a este botón.
          Estas dos funciones se las pasamos porque el componente Codigos se va a encargar de ejecutarlas. Al darle al botón copiar, ejecutará setVisibleMensajeCopy y setMensajeCopy
          La propiedad home nos va a servir para indicar al componente si es llamado por la página home (CocodePage) o por la otra (CocodeHistoricoPage). Para nosotros, esta es la home, luego pasamos un true */}
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
