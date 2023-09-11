import { BattleMode, BattleRule, Stage } from "."

export type MatchNodeResult = {
	mode: BattleMode;
	rule: BattleRule;
	maps: Stage[];
}