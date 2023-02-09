import { useNavigate } from 'react-router-dom';

// Página de NotFound
export const NotFoundPage = () => {
  const navigate = useNavigate();

  // Simplemente tiene un botón para que al pulsarlo ejecute esta función. navigate(-1) vuelve una página hacia atrás
  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="row mt-4">
        <div className="col">
          <h1>Cocode</h1>
          <hr />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col">
          <h2>Página no encontrada</h2>
          <button className="btn btn-success mt-2" onClick={goBack}>
            Volver atrás
          </button>
        </div>
      </div>
    </>
  );
};
