import type { Slot } from "./catalog";
export type Company = {
  id: string;
  name: string;
  industry: string;
  cash: number;
  employees: string[];
  upgrades: string[];
  created: number;
};
export type Player = {
  id: string;
  username: string;
  cash: number;
  bank: number;
  xp: number;
  earned: number;
  passiveEarned: number;
  inventory: string[];
  fit: Partial<Record<Slot, string>>;
  companies: Company[];
  jobsDone: number;
  lastSettled: number;
  created: number;
  playSeconds: number;
  activeJob: null | { id: string; started: number; nonce: string };
};
export type PublicPlayer = {
  id: string;
  username: string;
  netWorth: number;
  aura: number;
  level: number;
  fit: Player["fit"];
  companies: Company[];
  achievements: string[];
  cash?: number;
};
export type GameState = {
  player: Player;
  netWorth: number;
  aura: number;
  level: number;
  income: number;
  leaderboard: PublicPlayer[];
  achievements: string[];
  transactions: {
    id: string;
    reason: string;
    amount: number;
    created: number;
  }[];
};
