/**
 * Formatting helpers that copy the C# format strings in the backend
 * (VEXEmcee.Logic/InternalLogic on master), so demo strings match the real API exactly.
 */
import type { WinLossTie } from "./source";

/** C# "{value:P1}": 0.6667 becomes "66.7%" */
export const percent1 = (value: number): string => `${(value * 100).toFixed(1)}%`;

/** C# "{value:F1}": 42.857 becomes "42.9" */
export const fixed1 = (value: number): string => value.toFixed(1);

/** "6-3-0" */
export const formatWLT = (record: WinLossTie): string => `${record.Win}-${record.Loss}-${record.Tie}`;

export const matchCount = (record: WinLossTie): number => record.Win + record.Loss + record.Tie;

/** The backend's win percentage: a tie counts as half a win. 0 when there are no matches */
export const winPercentage = (record: WinLossTie): number => {
	const count = matchCount(record);
	return count > 0 ? (record.Win + 0.5 * record.Tie) / count : 0;
};

/** Average that returns 0 instead of NaN when there's nothing to average */
export const average = (total: number, count: number): number => (count > 0 ? total / count : 0);

export const addRecords = (a: WinLossTie, b: WinLossTie): WinLossTie => ({
	Win: a.Win + b.Win,
	Loss: a.Loss + b.Loss,
	Tie: a.Tie + b.Tie,
});
