import { AppProvider } from './context/AppProvider';
import { AppRouter } from './router/AppRouter';

// MainApp es el componente al que llama main.tsx
export const MainApp = () => {
  // El AppProvider es el proveedor del context. Al ponerlo aquí, todos sus hijos, es decir, todos los componentes de la aplicación, tendrán acceso al Context
  return (
    <>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </>
  );
};
