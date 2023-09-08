import { CoopSchedules } from "./coop_schedules";
import { CurrentFest } from "./fest";
import { VsStages } from "./stages";
import { VsSchedules } from "./vs_schedules";

export type Splatoon3InkSchedules = VsSchedules & CoopSchedules & CurrentFest & VsStages;
export type Splatoon3InkSchedulesResponse = { data: Splatoon3InkSchedules };