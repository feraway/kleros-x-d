import { createContext } from "react";
import { GameType } from "@types";

export type StateContextType = {
  setGames: (games: GameType[] | ((games: GameType[]) => GameType[])) => void;
  games: GameType[];
};

export default createContext<StateContextType>({
  setGames: () => [],
  games: [],
});
