import { TimePeriod } from "./common";

type VsStage = {
	vsStageId: number;
	name: string;
	image: { url: string };
	id: string;
}

type VsRule = {
	name: string;
	rule: string;
	id: string;
}

type MatchSetting = {
	__isVsSetting: "RegularMatchSetting" | "BankaraMatchSetting" | "XMatchSetting" | "LeagueMatchSetting" | "FestMatchSetting";
	__typename: "RegularMatchSetting" | "BankaraMatchSetting" | "XMatchSetting" | "LeagueMatchSetting" | "FestMatchSetting";
	vsStages: VsStage[2];
	vsRule: VsRule;
}

type RegularMatchSetting = MatchSetting & {
	__isVsSetting: "RegularMatchSetting";
	__typename: "RegularMatchSetting";
};

type BankaraMatchSetting = MatchSetting & {
	__isVsSetting: "BankaraMatchSetting";
	__typename: "BankaraMatchSetting";
	bankaraMode: "CHALLENGE" | "OPEN";
}

type XMatchSetting = MatchSetting & {
	__isVsSetting: "XMatchSetting";
	__typename: "XMatchSetting";
}

type LeagueMatchEvent = {
	leagueMatchEventId: string;
	name: string;
	desc: string;
	regulationUrl?: string;
	regulation: string;
	id: string;
}

type LeagueMatchSetting = MatchSetting & {
	__isVsSetting: "LeagueMatchSetting";
	__typename: "LeagueMatchSetting";
	leagueMatchEvent: LeagueMatchEvent;
}

type FestMatchSetting = MatchSetting & {
	__isVsSetting: "FestMatchSetting";
	__typename: "FestMatchSetting";
	festMode: "CHALLENGE" | "REGULAR";
}

type ScheduleNode = TimePeriod & {
	festMatchSettings?: { __typename: "FestMatchSetting" }[2];
}

type RegularScheduleNode = ScheduleNode & {
	regularMatchSetting?: RegularMatchSetting;
}

type BankaraScheduleNode = ScheduleNode & {
	bankaraMatchSettings?: BankaraMatchSetting[2];
}

type XScheduleNode = ScheduleNode & {
	xMatchSetting?: XMatchSetting;
}

type EventScheduleNode = ScheduleNode & {
	leagueMatchSetting: LeagueMatchSetting;
	timePeriods: TimePeriod[];
}

type FestSchduleNode = ScheduleNode & {
	festMatchSettings?: FestMatchSetting[2];
}

type RegularSchedules = {
	nodes: RegularScheduleNode[12];
}

type BankaraSchedules = {
	nodes: BankaraScheduleNode[12];
}

type XSchedules = {
	nodes: XScheduleNode[12];
}

type EventSchedules = {
	nodes: EventScheduleNode[2];
}

export type VsSchedules = {
	regularSchedules: RegularSchedules;
	bankaraSchedules: BankaraSchedules;
	xSchedules: XSchedules;
	eventSchedules: EventSchedules;
}