import { CoopSchedules } from "./coop_schedules";
import { CurrentFest } from "./fest";
import { VsStages } from "./stages";
import { RawVsSchedules, VsSchedules } from "./vs_schedules";

export type RawSplatoon3InkSchedules = RawVsSchedules & CoopSchedules & CurrentFest & VsStages;
export type Splatoon3InkSchedules = VsSchedules & CoopSchedules & CurrentFest & VsStages;
export type Splatoon3InkSchedulesResponse = { data: RawSplatoon3InkSchedules };