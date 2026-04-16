export type PetState = "normal" | "sick" | "evolved";

export interface GameState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  status: PetState;
  sickSince: number | null;
  allStatsHighSince: number | null;
  totalCareActions: number;
  lastInteraction: number;
  lastSaved: number;
}

export const DEFAULT_STATE: GameState = {
  name: "",
  hunger: 70,
  happiness: 70,
  energy: 70,
  status: "normal",
  sickSince: null,
  allStatsHighSince: null,
  totalCareActions: 0,
  lastInteraction: Date.now(),
  lastSaved: Date.now(),
};
