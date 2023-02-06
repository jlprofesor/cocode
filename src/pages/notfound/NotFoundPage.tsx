import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

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
          <button className="btn btn-success" onClick={goBack}>
            Volver atrás
          </button>
        </div>
      </div>
    </>
  );
};
