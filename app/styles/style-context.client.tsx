import { createContext } from 'react';

type ClientStyleContextData = {
  reset: () => void;
};

const ClientStyleContext = createContext<ClientStyleContextData | null>(null);

export default ClientStyleContext;
