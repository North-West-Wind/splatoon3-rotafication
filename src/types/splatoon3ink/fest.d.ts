import { TimePeriod } from "./common";

// Quick note: These range from 0 to 1
type Color = {
	a: number;
	b: number;
	g: number;
	r: number;
}

type Team = {
	id: string;
	color: Color;
	// myVoteState: null;
}

type TricolorStage = {
	name: string;
	image: { url: string };
	id: string;
}

type Fest = TimePeriod & {
	id: string;
	title: string;
	midtermTime: string;
	state: "SCHEDULED"; // TODO: other states
	teams: Team[3];
	tricolorStage: TricolorStage;
}

export type CurrentFest = {
	currentFest: Fest;
}