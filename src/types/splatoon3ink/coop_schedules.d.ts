import { TimePeriod } from "./common";

type CoopStage = {
	name: string;
	thumbnailImage: { url: string };
	image: { url: string };
	id: string;
}

type CoopWeapon = {
	__splatoon3ink_id: string;
	name: string;
	image: { url: string };
}

type CoopSetting = {
	__isCoopSetting: "CoopNormalSetting";
	__typename: "CoopNormalSetting";
	coopStage: CoopStage;
	weapons: CoopWeapon[4];
	__splatoon3ink_king_salmonid_guess: "Cohozuna" | "Horrorboros";
}

type ScheduleNode = TimePeriod;

type RegularScheduleNode = ScheduleNode & {
	setting: CoopSetting;
}

type RegularSchedules = {
	nodes: RegularScheduleNode[5];
}

type BigRunSchedules = {
	// TODO
	nodes: unknown[];
}

type TeamContestSchedules = {
	// TODO
	nodes: unknown[];
}

type CoopGroupingSchedule = {
	bannerImage?: string;
	regularSchedules: RegularSchedules;
	bigRunSchedules: BigRunSchedules;
	teamContestSchedules: TeamContestSchedules;
}

export type CoopSchedules = {
	coopGroupingSchedule: CoopGroupingSchedule;
}