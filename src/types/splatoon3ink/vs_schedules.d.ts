import { Stage } from "../rotafication";
import { TimePeriod } from "./common";

type VsStage = {
	vsStageId: number;
	name: Stage;
	image: { url: string };
	id: string;
}

type VsRule = {
	name: "Turf War" | "Splat Zones";
	rule: "TURF_WAR" | "AREA";
	id: string;
}

type MatchSetting = {
	__isVsSetting: "RegularMatchSetting" | "BankaraMatchSetting" | "XMatchSetting" | "LeagueMatchSetting" | "FestMatchSetting";
	__typename: "RegularMatchSetting" | "BankaraMatchSetting" | "XMatchSetting" | "LeagueMatchSetting" | "FestMatchSetting";
	vsStages: VsStage[];
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
	festMatchSettings?: { __typename: "FestMatchSetting" }[];
}

type RegularScheduleNode = ScheduleNode & {
	regularMatchSetting?: RegularMatchSetting;
}

type RawBankaraScheduleNode = ScheduleNode & {
	bankaraMatchSettings?: BankaraMatchSetting[];
}

type BankaraScheduleNode = ScheduleNode & {
	bankaraMatchSetting?: BankaraMatchSetting;
}

type XScheduleNode = ScheduleNode & {
	xMatchSetting?: XMatchSetting;
}

type EventScheduleNode = ScheduleNode & {
	leagueMatchSetting: LeagueMatchSetting;
	timePeriods: TimePeriod[];
}

type RawFestScheduleNode = ScheduleNode & {
	festMatchSettings?: FestMatchSetting[];
}

type FestScheduleNode = ScheduleNode & {
	festMatchSetting?: FestMatchSetting;
}

type RegularSchedules = {
	nodes: RegularScheduleNode[];
}

type RawBankaraSchedules = {
	nodes: RawBankaraScheduleNode[];
}

type BankaraSchedules = {
	nodes: BankaraScheduleNode[];
}

type XSchedules = {
	nodes: XScheduleNode[];
}

type EventSchedules = {
	nodes: EventScheduleNode[];
}

type RawFestSchedules = {
	nodes: RawFestScheduleNode[];
}

type FestSchedules = {
	nodes: FestScheduleNode[];
}

export type RawVsSchedules = {
	regularSchedules: RegularSchedules;
	bankaraSchedules: RawBankaraSchedules;
	xSchedules: XSchedules;
	eventSchedules: EventSchedules;
	festSchedules: RawFestSchedules;
}

export type VsSchedules = {
	regularSchedules: RegularSchedules;
	bankaraChallengeSchedules: BankaraSchedules;
	bankaraOpenSchedules: BankaraSchedules;
	xSchedules: XSchedules;
	eventSchedules: EventSchedules;
	festChallengeSchedules: FestSchedules;
	festRegularSchedules: FestSchedules;
}