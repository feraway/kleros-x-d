import { Address } from "wagmi";

export type GameType = {
  address: Address;
  salt?: string;
  move?: number;
  lastActionTimestamp?: number;
};
