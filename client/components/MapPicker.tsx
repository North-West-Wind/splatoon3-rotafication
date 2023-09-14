import React from "react";
import { Stage } from "../types/rotafication";

const STAGES: Stage[] = [
	"Any",
	"Barnacle & Dime",
	"Brinewater Springs",
	"Crableg Capital",
	"Eeltail Alley",
	"Flouder Heights",
	"Hagglefish Market",
	"Hammerhead Bridge",
	"Humpback Pump Track",
	"Inkblot Art Academy",
	"Mahi-Mahi Resort",
	"MakoMart",
	"Manta Maria",
	"Mincemeat Metalworks",
	"Museum D'Alfonsino",
	"Scorch Gorge",
	"Shipshape Cargo Co.",
	"Sturgeon Shipyard",
	"Um'ami Ruins",
	"Undertow Spillway",
	"Wahoo World"
];

type Property = {
	value: Stage;
	onChange: (picked: Stage) => void;
}

export default class MapPicker extends React.Component<Property> {
	state: Property;

	constructor(props: Property) {
		super(props);
		this.state = { value: props.value, onChange: props.onChange };
	}

	onChange(s: Stage) {
		this.setState({ value: s });
		this.state.onChange(s);
	}

	render() {
		// <p className="description">{this.state.desc}</p>
		return <div className="flex flex-vcenter">
			<div className="map-container">
				<div className="flex flex-hcenter flex-vcenter">
					<select onChange={(e) => this.onChange(STAGES[parseInt(e.target.value)])} defaultValue={STAGES.indexOf(this.state.value)}>
						{STAGES.map((s, ii) => <option key={ii} value={ii}>{s}</option>)}
					</select>
				</div>
				<div className="flex flex-hcenter flex-vcenter">
					<img src={`get-thumb/${encodeURIComponent(this.state.value)}`} className="map" />
				</div>
			</div>
		</div>
	}
}