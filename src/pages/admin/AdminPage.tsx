import { useForm } from '../../hooks/useForm';
import { db } from '../../config/firebaseConfig';
import { FormEvent, useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  query,
  updateDoc
} from 'firebase/firestore';
import { ICurso } from '../../interfaces/curso.interface';
import { AppContext } from '../../context/AppContext';

export const AdminPage = () => {
  // Traemos del context setCurso. Lo vamos a necesitar porque el administrador va a poder cambiar el curso actual. Ese curso será el que el administrador utilizará para compartir el código en las sesiones de clase
  const { setCurso } = useContext(AppContext);
  // useState para gestionar los cursos que van a venir de Firestore
  const [cursos, setCursos] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  // useState para gestionar los mensajes que notifican que los cursos se están cargando
  const [loading, setLoading] = useState<boolean>(true);
  // useState para controlar cuando estamos editando (edit== true) o agregando cursos (edit== false)
  const [edit, setEdit] = useState<boolean>(false);
  // useState para controlar el id del curso que se está editando
  const [idEdit, setIdEdit] = useState<boolean>(false);
  // Llamamos al hook useForm para nuestro formulario de cursos
  const { form, onInputChange, onResetForm, onSetForm } = useForm<ICurso>({
    nombre: '',
    actual: false
  });

  const { nombre, actual } = form;

  // El submit del formulario agregará un curso o lo modificará. Dependerá del valor de edit (true o false)
  const saveCurso = async (e: FormEvent) => {
    e.preventDefault();
    // Si edit es true actualizamos el curso con el nuevo nombre
    if (edit) {
      // Capturamos el curso mediante el método doc de Firestore, en nuestra base de datos (db), colección cursos/idEdit (id del curso que se está editando)
      const curso = doc(db, `cursos/${idEdit}`);
      // setDoc es un método de Firestore que permite actualizar los valores a un documento. El documento es la constante anterior curso y los valores, los del formulario
      await setDoc(curso, {
        nombre: nombre,
        actual: actual
      });
      // Finalizamos de editar y restauramos la opción de agregar nuevo por defecto
      setEdit(false);
      // Ponemos el loading a true para recargar de forma automática los cursos mediante el useEffect posterior
      setLoading(true);
      // Si edit no es true agregamos un nuevo curso
    } else {
      // addDoc es un método de Firestore que permite agregar documentos a una colección. La colección está en nuestra base de datos (db) y será cursos
      // Los valores son el nombre que hemos escrito en el formulario y el campo actual con el valor false
      await addDoc(collection(db, 'cursos'), {
        nombre: nombre,
        actual: false
      });
      // Ponemos el loading a true para recargar de forma automática los cursos mediante el useEffect posterior
      setLoading(true);
    }
    // Limpiamos el formulario
    onResetForm();
  };

  const deleteCurso = async (curso: DocumentData) => {
    if (window.confirm(`¿Estás seguro de eliminar ${curso.data().nombre}?`)) {
      // Borrar curso
      // Capturamos el curso a eliminar. La técnica es la misma que hemos usado en la función de guardar
      const cursoDelete = doc(db, `cursos/${curso.id}`);
      // deleteDoc es una función de Firestore que nos permite eliminar un documento
      await deleteDoc(cursoDelete);

      // Además de eliminar el curso, debemos borrar los códigos del curso
      await deleteCodigo(curso);
      // Ponemos el loading a true para recargar de forma automática los cursos mediante el useEffect posterior
      setLoading(true);
    }
  };

  const deleteCodigoCurso = async (curso: DocumentData) => {
    if (window.confirm(`¿Estás seguro de eliminar el código del curso ${curso.data().nombre}?`)) {
      await deleteCodigo(curso);
    }
  };

  const deleteCodigo = async (curso: DocumentData) => {
    // Hacemos una referencia a la colección codigo mediante el método de Firestore collection
    const codigos = collection(db, 'codigo');
    // Construimos una consulta (método de Firestore query) en la referencia a codigos, donde (where) el curso sea igual al id del curso eliminado
    const q = query(codigos, where('curso', '==', curso.id));
    // getDocs es un método Firestore que nos extrae los documentos de la consulta anterior (q). Volvamos esos datos en codigosEliminar
    const codigosEliminar = await getDocs(q);
    // Iteramos todos los códigos
    codigosEliminar.forEach(async (codigo) => {
      // Hacemos una referencia a cada uno
      const codigoDelete = doc(db, `codigo/${codigo.id}`);
      // Y lo eliminamos
      await deleteDoc(codigoDelete);
    });
  };

  // Función para establecer un curso como curso actual. El curso actual será aquel que el administrador establecerá como curso vigente
  const setActual = async (curso: DocumentData) => {
    if (window.confirm(`¿Estás seguro de fijar ${curso.data().nombre} como curso actual?`)) {
      // Primero ponemos todos los cursos con su propiedad actual a false
      // Hacemos una referencia a la colección cursos mediante el método de Firestore collection
      const cursos = collection(db, 'cursos');
      // Construimos una consulta (método de Firestore query) en la referencia a cursos, donde (where) la propiedad actual del curso sea true
      const q = query(cursos, where('actual', '==', true));
      // getDocs es un método Firestore que nos extrae los documentos de la consulta anterior (q). Volvamos esos datos en cursosAModificar
      const cursosAModificar = await getDocs(q);
      // Iteramos todos
      cursosAModificar.forEach(async (curso) => {
        // Establecemos una referencia a cada uno
        const cursoModificar = doc(db, `cursos/${curso.id}`);
        // Y establecemos su propiedad actual a false
        // updateDoc es otro método Firestore. Este nos permite modificar un documento con unos determinados valores
        await updateDoc(cursoModificar, {
          actual: false
        });
      });

      // Después de poner todos los cursos con el actual a false, el curso que hemos elegido lo pondremos con el actual a true
      // Establecemos una referencia al curso
      const cursoActual = doc(db, `cursos/${curso.id}`);
      // Y lo actualizamos
      await updateDoc(cursoActual, {
        actual: true
      });

      // Y ahora es muy importante pasar este curso al context para que toda la aplicación tenga acceso al curso actual. Lo hacemos mediante setCurso, función que la hemos importado del context
      setCurso({ id: curso.id, nombre: curso.data().nombre, actual: curso.data().actual });
      // Ponemos el loading a true para recargar de forma automática los cursos mediante el useEffect posterior
      setLoading(true);
    }
  };

  // Función que va a permitir pasar los datos del curso pinchado a los cuadros de edición (en este caso solo el nombre del curso)
  const editCurso = (curso: DocumentData) => {
    // Construimos un objeto con el curso que estamos editando
    const cursoEdit: ICurso = {
      nombre: curso.data().nombre,
      actual: curso.data().actual,
      id: curso.id
    };
    // Y lo pasamos al formulario
    onSetForm(cursoEdit);
    // También necesitamos comunicar al componente el id del curso que estamos modificando para luego poder actualizar ese curso en concreto. Lo hacemos con setIdEdit
    setIdEdit(curso.id);
    // Además, comunicamos al componente que estamos editando (true). Esto será necesario porque cuando hagamos el submit del formulario, si edit es true actualizaremos el curso, pero si es false agregaremos uno nuevo
    setEdit(true);
  };

  // El botón cancelar edición limpia el formulario y establece la opción por defecto a agregar nuevo (pone edit a false)
  const cancelarEdicion = () => {
    onResetForm();
    setEdit(false);
  };

  // Este useEffect es sensible al loading. Cada vez que ponemos el loading a true (setLoading(true)) viene aquí y carga los cursos
  useEffect(() => {
    if (loading) {
      const getCursos = async () => {
        // getDocs es un método Firestore que nos permite volcar todos los documentos de una colección (collection) de nuestra base de datos (db)
        const cursos = await getDocs(collection(db, 'cursos'));
        // La propiedad docs tiene todos los cursos. Los pasamos a cursos gracias setCursos
        setCursos(cursos.docs);
        // Ponemos el loading a false
        setLoading(false);
      };

      getCursos();
    }
  }, [loading]); // Aquí registramos la dependencia del loading para que el useEffect reaccione al cambio de valor de loading

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <h1>Administración de Cocode</h1>
          <hr />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-8">
          {loading && <div className="alert alert-info text-center">Cargando...</div>}
          {!loading && cursos.length > 0 && (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Actual</th>
                  <th scope="col">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Iteramos cada curso y por cada uno sacamos su nombre y un sí o un no dependiendo de si actual es true o false */}
                {cursos.map((x) => {
                  return (
                    <tr key={x.id}>
                      <td>{x.data().nombre}</td>
                      <td>{x.data().actual ? 'Sí' : 'No'}</td>
                      {/* También generamos un botón por cada curso. Cada botón llama a una función diferente, ya sea para editar, establecer el curso como actual o borrarlo. Cada una de los eventos click de estos botones llama a su función correspondiente pasándole por parámetro el curso (x) */}
                      <td>
                        <button className="btn btn-primary" onClick={() => editCurso(x)}>
                          Editar
                        </button>
                        <button className="btn btn-warning" onClick={() => setActual(x)}>
                          Fijar como actual
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteCurso(x)}>
                          Eliminar
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteCodigoCurso(x)}>
                          Eliminar código
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="col">
          {/* Al hacer el submit del formulario guardamos el curso */}
          <form onSubmit={saveCurso}>
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                className="form-control"
                value={nombre}
                onChange={onInputChange}
                required
              />
            </div>
            {/* Si edit es true (modo edición) mostramos el botón cancelar edición */}
            {edit && (
              <button type="button" className="btn btn-secondary mt-2" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
            {/* Dependiendo de si edit es true o false mostramos el mensaje Actualizar o Agregar */}
            <button type="submit" className="btn btn-primary mt-2">
              {edit ? 'Actualizar' : 'Agregar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
