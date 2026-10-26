// All sixty days, in order.
import type { Mission } from "../types";
import { MONTH_1 } from "./missions-month1";
import { MONTH_2 } from "./missions-month2";
import { MONTH_3 } from "./missions-month3";

export const MISSIONS: readonly Mission[] = [...MONTH_1, ...MONTH_2, ...MONTH_3];
