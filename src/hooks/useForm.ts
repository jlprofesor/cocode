import { useState, ChangeEvent } from 'react';

// <T> Es el llamado tipo genérico de TypeScript. Como este hook personalizado va a servirnos para gestionar cualquier formulario. En cada caso, los datos a gestionar serán diferentes.
// Por ejemplo, en un formulario de login gestionaremos el email y el password, en uno de facturas todos los campos para dar de alta una factura... En este caso, será el continente
export const useForm = <T>(initialForm: T) => {
  const [form, setForm] = useState<T>(initialForm);

  // Al cambiar cualquier campo, este se modifica y gracias a setForm se genera un nuevo estado del formulario.
  // Este nuevo estado tendrá todas las propiedades del formulario (...form) y el valor del campo modificado ([id]) con el nuevo valor (value)
  const onTextAreaChange = ({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value
    });
  };

  const onInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value
    });
  };

  // Nueva función para dar valores al formulario
  const onSetForm = (form: T) => {
    setForm(form);
  };

  // Al ejecutar esta función volvemos al estado inicial
  const onResetForm = () => {
    setForm(initialForm);
  };

  // Devolvemos todo el formulario y de esas propiedades cambiamos la propiedad form con el tipo de objeto que estamos gestionando (as T) y las funciones.
  // Todo esto lo podrá utilizar el componente que llame a este hook
  return {
    form: form as T,
    onInputChange,
    onTextAreaChange,
    onSetForm,
    onResetForm
  };
};
