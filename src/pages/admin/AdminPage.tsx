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
  const { curso, setCurso } = useContext(AppContext);
  const [cursos, setCursos] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [edit, setEdit] = useState<boolean>(false);
  const [idEdit, setIdEdit] = useState<boolean>(false);
  const { form, onInputChange, onResetForm, onSetForm } = useForm<ICurso>({
    nombre: '',
    actual: false
  });

  const { nombre, actual } = form;

  const saveCurso = async (e: FormEvent) => {
    e.preventDefault();
    if (edit) {
      const curso = doc(db, `cursos/${idEdit}`);
      await setDoc(curso, {
        nombre: nombre,
        actual: actual
      });
      setEdit(false);
      setLoading(true);
    } else {
      await addDoc(collection(db, 'cursos'), {
        nombre: nombre,
        actual: false
      });
      setLoading(true);
    }
    onResetForm();
  };

  const deleteCurso = async (curso: DocumentData) => {
    if (window.confirm(`¿Estás seguro de eliminar ${curso.data().nombre}?`)) {
      // Borrar curso
      const cursoDelete = doc(db, `cursos/${curso.id}`);
      await deleteDoc(cursoDelete);

      // Borrar códigos del curso
      const codigos = collection(db, 'codigo');
      const q = query(codigos, where('curso', '==', curso.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (codigo) => {
        const codigoDelete = doc(db, `codigo/${codigo.id}`);
        console.log(codigo.id);
        await deleteDoc(codigoDelete);
      });
      setLoading(true);
    }
  };

  const setActual = async (curso: DocumentData) => {
    if (window.confirm(`¿Estás seguro de fijar ${curso.data().nombre} como curso actual?`)) {
      const cursos = collection(db, 'cursos');
      const q = query(cursos, where('actual', '==', true));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (curso) => {
        const cursoRef = doc(db, `cursos/${curso.id}`);
        await updateDoc(cursoRef, {
          actual: false
        });
      });

      const cursoActual = doc(db, `cursos/${curso.id}`);
      await updateDoc(cursoActual, {
        actual: true
      });

      setCurso({ id: curso.id, nombre: curso.data().nombre, actual: curso.data().actual });
      setLoading(true);
    }
  };

  const editCurso = (curso: DocumentData) => {
    const cursoEdit: ICurso = {
      nombre: curso.data().nombre,
      actual: curso.data().actual,
      id: curso.id
    };
    onSetForm(cursoEdit);
    setIdEdit(curso.id);
    setEdit(true);
  };

  const cancelarEdicion = () => {
    onResetForm();
    setEdit(false);
  };

  useEffect(() => {
    if (loading) {
      const getCursos = async () => {
        const cursos = await getDocs(collection(db, 'cursos'));
        setCursos(cursos.docs);
        setLoading(false);
      };

      getCursos();
    }
  }, [loading]);

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <h1>Administración de Cocode</h1>
          <hr />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col">
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
                {cursos.map((x) => {
                  return (
                    <tr key={x.id}>
                      <td>{x.data().nombre}</td>
                      <td>{x.data().actual ? 'Sí' : 'No'}</td>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="col">
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
            {edit && (
              <button type="button" className="btn btn-secondary mt-2" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
            <button type="submit" className="btn btn-primary mt-2">
              {edit ? 'Actualizar' : 'Agregar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
