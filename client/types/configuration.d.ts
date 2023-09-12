export type BattleMode = "any" | "regular" | "bankara" | "x" | "event" | "fest";
export type BattleRule = "ANY" | "TURF_WAR" | "AREA" | "LOFT" | "GOAL" | "CLAM";
export type Stage =
	"Any" |
	"Barnacle & Dime" |
	"Brinewater Springs" |
	"Crableg Capital" |
	"Eeltail Alley" |
	"Flouder Heights" |
	"Hagglefish Market" |
	"Hammerhead Bridge" |
	"Humpback Pump Track" |
	"Inkblot Art Academy" |
	"Mahi-Mahi Resort" |
	"MakoMart" |
	"Manta Maria" |
	"Mincemeat Metalworks" |
	"Museum D'Alfonsino" |
	"Scorch Gorge" |
	"Shipshape Cargo Co." |
	"Sturgeon Shipyard" |
	"Um'ami Ruins" |
	"Undertow Spillway" |
	"Wahoo World"

export type RotaficationFilter = {
	mode: BattleMode;
	rule: BattleRule;
	maps: Stage[];
	before: number;
}