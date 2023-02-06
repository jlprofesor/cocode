import { useForm } from '../../hooks/useForm';
import { ICodigo } from '../../interfaces/codigo.interface';
import { db } from '../../config/firebaseConfig';
import { FormEvent, useEffect, useState } from 'react';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Codigos } from '../../components/Codigos';

export const AdminPage = () => {
  const [visibleMensajeCopy, setVisibleMensajeCopy] = useState<boolean>(false);
  const [mensajeCopy, setMensajeCopy] = useState<string>('');
  const [codigos, setCodigos] = useState<QueryDocumentSnapshot<DocumentData>[] | null>(null);

  // Llamada al hook useForm para gestionar el formulario
  const { form, onInputChange, onTextAreaChange, onResetForm } = useForm<ICodigo>({
    codigo: '',
    cabecera: ''
  });

  const { codigo, cabecera } = form;

  const saveCodigo = async (e: FormEvent) => {
    // e.preventDefault();
    // await addDoc(collection(db, 'codigo'), {
    //   codigo: codigo,
    //   cabecera: cabecera,
    //   created: Timestamp.fromDate(new Date())
    // });
    // onResetForm();
    // window.scrollTo(0, document.body.scrollHeight);
  };

  useEffect(() => {
    // const start = new Date();
    // start.setHours(0, 0, 0, 0);
    // const end = new Date(start.getTime());
    // end.setHours(23, 59, 59, 999);
    // const q = query(
    //   collection(db, 'codigo'),
    //   where('created', '>=', start),
    //   where('created', '<=', end),
    //   orderBy('created', 'asc')
    // );
    // onSnapshot(q, (querySnapshot) => {
    //   setSnapshot(querySnapshot);
    //   window.scrollTo(0, document.body.scrollHeight);
    //   querySnapshot.docs.length > 0 && beep.play();
    // });
  }, []);

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
            <Codigos codigos={codigos} setVisibleMensajeCopy={setVisibleMensajeCopy} setMensajeCopy={setMensajeCopy} />
          )}
        </div>
      </div>
    </>
  );
};
