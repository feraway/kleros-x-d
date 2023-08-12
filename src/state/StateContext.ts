import { createContext } from "react";
import { Address } from "wagmi";

export type StateContextType = {
  gameAddress?: string;
  setGameAddress: (address?: Address) => void;
};

export default createContext<StateContextType>({
  gameAddress: undefined,
  setGameAddress: () => undefined,
});
