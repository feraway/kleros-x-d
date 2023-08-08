import { createContext } from "react";

export type StateContextType = {
  gameAddress?: string;
  setGameAddress: (address: string) => void;
};

export default createContext<StateContextType>({
  gameAddress: undefined,
  setGameAddress: () => undefined,
});
