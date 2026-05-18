import { Provider } from "jotai";

import AppRouter from "./router";
import { store } from "./store";
import { SessionProvider } from "./providers/SessionProvider";

import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <Provider store={store}>
      <SessionProvider>
        <AppRouter />
        <ToastContainer />
      </SessionProvider>
    </Provider>
  );
}
