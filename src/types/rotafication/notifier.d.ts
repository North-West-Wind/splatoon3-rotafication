import { BattleMode, BattleRule, Stage } from "."

export type MatchNodeResult = {
	mode: BattleMode;
	rule: BattleRule;
	maps: Stage[];
}

export type Payload = {
	title: string;
	body: string;
	icon: string;
	image: string;
	badge: string;
}