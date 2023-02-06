import { AppProvider } from './context/AppProvider';
import { AppRouter } from './router/AppRouter';

export const MainApp = () => {
  return (
    <>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </>
  );
};
