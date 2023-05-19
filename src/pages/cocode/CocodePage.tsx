import { useForm } from '../../hooks/useForm';
import { ICodigo } from '../../interfaces/codigo.interface';
import { db } from '../../config/firebaseConfig';
import { FormEvent, useContext, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  where
} from 'firebase/firestore';
import { Codigos } from '../../components/Codigos';
import { AppContext } from '../../context/AppContext';

export const CocodePage = () => {
  // Extraemos del context  el curso actual
  const { curso, usuario } = useContext(AppContext);
  const { beep } = useContext(AppContext);
  // useState para controlar si el mensaje de aviso de texto copiado está visible o no. En este componente, visibleMensajeCopy se utiliza para ver o no ver el mensaje de texto copiado
  // setVisibleMensajeCopy se le pasará al componente Codigos porque desde ese componente entrará en acción al pulsar el botón copiar de cada código.
  const [visibleMensajeCopy, setVisibleMensajeCopy] = useState<boolean>(false);
  // useState para controlar el contenido del mensaje cuando se le pulsa al botón copiar. En este componente se utiliza para mostrar el mensaje. Al igual que le useState anterior, se le pasa
  // al componente Codigos setMensajeCopy porque desde ese componente entrará en acción cuando se construya el mensaje al pulsar el botón copiar de cada código.
  const [mensajeCopy, setMensajeCopy] = useState<string>('');
  // Más adelante se maneja la suscripción en tiempo real a los códigos. Firestore dispone de un método onSnapshot que aparece después que formaliza la suscripción.
  // Este useState actualizará en snapShot la suscripción a los códigos de Firestore en tiempo real. snapShot hace alusión a algo así como una foto en tiempo real de la colección de códigos
  const [snapShot, setSnapshot] = useState<QuerySnapshot<DocumentData> | null>(null);
  // El snapShot anterior contiene los datos y otra información adjunta, como ocurre con fetch. Necesitaremos los códigos y este useState los actualizará
  const [codigos, setCodigos] = useState<QueryDocumentSnapshot<DocumentData>[] | null>(null);

  // Audio para reproducir cuando llegue un código nuevo
  const beepNewCode = new Audio(
    'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
  );

  // Llamada al hook useForm para gestionar el formulario. Cada código tiene una cabecera, el código en sí mismo y el curso al que pertenece. Este se obtiene del context de la aplicación gracias al uso del hook useContext
  const { form, onInputChange, onTextAreaChange, onResetForm } = useForm<ICodigo>({
    cabecera: '',
    codigo: '',
    curso: '',
    admin: false
  });

  // Desestructuramos el codigo y la cabecera para obtener los valores de forma individualizada
  const { cabecera, codigo } = form;

  // Evento que se va a disparar al guardar el formulario (submit)
  const saveCodigo = async (e: FormEvent) => {
    e.preventDefault();
    // addDoc es un proceso asíncrono de Firestore para agregar un documento a una colección. En este caso un código a la colección códigos
    // db representa a la base de datos (importada en la parte de arriba del archivo de configuración de Firebase). codigo es el nombre de la colección
    // Cada código nuevo tendrá el id del curso actual que irá al campo curso, el código y la cabecera del formulario y un campo created con la fecha y hora actuales
    // Timestamp es una clase de Firestore especial dar tipo a un campo como fecha y hora. Le pasamos la fecha y hora actuales (new Date()) para poder filtrar posteriormente por fechas
    await addDoc(collection(db, 'codigo'), {
      curso: curso.id,
      codigo: codigo,
      cabecera: usuario.nombreUsuario !== '' ? 'PROFE - ' + cabecera : cabecera,
      created: Timestamp.fromDate(new Date()),
      admin: usuario.nombreUsuario !== ''
    });
    // Utilizamos el onResetForm del hook useForm para limpiar el formulario
    onResetForm();
    // La siguiente instrucción focaliza el navegador al final de la página para poder ver de forma automática el último código
    // window.scrollTo(0, document.body.scrollHeight);
  };

  // Este useEffect se encarga de, una vez recibido el curso del context, suscribirnos en tiempo real a los cambios de ese curso
  useEffect(() => {
    // Este if es porque los primeros instantes, el curso tiene un id que es un string vacío, porque es así como en el context se inicializa. Cuando llegue, cambiará el curso y entonces se ejecutará el useEffect
    if (curso.id !== '') {
      // start y end son las fechas desde/hasta las que queremos recibir el código
      // Queremos recibir el código de hoy (new Date()), desde las 0:0:0 hasta las 23:59
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime());
      end.setHours(23, 59, 59, 999);
      // query permite construir una consulta en Firestore
      // En este caso, de la colección código de la base de datos obtenemos los códigos que tienen el id del curso actual, entre las dos fechas, ordenados de forma ascendente
      const q = query(
        collection(db, 'codigo'),
        where('curso', '==', curso.id),
        where('created', '>=', start),
        where('created', '<=', end),
        orderBy('created', 'asc')
      );
      // onSnapshot también forma parte de Firestore. Permite suscribirnos en tiempo real a una consulta.
      // En este caso a nuestra consulta anterior (q). Los datos se vuelcan de forma automática a querySnapshot (podría tener otro nombre) y estos se pasan
      onSnapshot(q, (querySnapshot) => {
        // Actualizamos el snapshot
        setSnapshot(querySnapshot);
        // Nos movemos hacia abajo
        // window.scrollTo(0, document.body.scrollHeight);
        // Si el snapshot tiene documentos (docs.length>0), es que tiene códigos. Entonces emitimos el sonido.
        if (querySnapshot.docs.length > 0 && beep.audio) {
          beepNewCode.play();
        }
      });
    }
  }, [curso]); // Aquí está la dependencia del useEffect para que se ejecute automáticamente cada vez que cambie el curso

  // Este useEffect se produce cuando snapShot cambia. Este cambiará cada vez que vengan datos nuevos, luego lo que hay dentro se ejecutará de forma automática cuando pase esto
  useEffect(() => {
    // Si el snapShot no es nulo (su valor por defecto en el useState es null) se pasan a todos los códigos (docs) al useState que los maneja para poder renderizarlos
    // mediante la desestructuración, podemos pasar todos los elementos del array docs del snapShot en vez de iterar uno a uno.
    snapShot && setCodigos([...snapShot.docs].reverse()); // Un alumno pidió que el orden fuera descendente
  }, [snapShot]); // Aquí está la dependencia del useEffect para que se ejecute automáticamente cada vez que cambie el snapShot

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <h1>Cocode diario</h1>
          <hr />
          {/* Ponemos el nombre del curso. Este curso se obtiene previamente del context gracias al hook useContext */}
          <h2>Curso: {curso.nombre}</h2>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col">
          {/* submit del formulario para guardar un nuevo código en Firestore */}
          <form onSubmit={saveCodigo}>
            <div className="form-group">
              <label className="form-label" htmlFor="cabecera">
                Cabecera
              </label>
              <input className="form-control" id="cabecera" value={cabecera} onChange={onInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="codigo">
                Código
              </label>
              <textarea
                className="form-control"
                id="codigo"
                rows={10}
                value={codigo}
                onChange={onTextAreaChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary mt-2">
              Enviar código
            </button>
            <button type="button" onClick={onResetForm} className="btn btn-warning mt-2 ">
              Limpiar datos
            </button>
          </form>
        </div>
      </div>
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
              home={true}
            />
          )}
        </div>
      </div>
    </>
  );
};
