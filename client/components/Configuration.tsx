import React from "react";
import { BattleMode, BattleRule, RotaficationFilter, Stage } from "../types/configuration";
import Rodal from "rodal";
import 'rodal/lib/rodal.css';
import "./css/rodal.css";
import MapPicker from "./MapPicker";

export default class Configuration extends React.Component {
	state: {
		vertical: boolean,
		filters: RotaficationFilter[],
		pickingMode: boolean,
		pickingRule: boolean,
		editingIndex: number,
		rodalWidth: number,
		rodalHeight: number
	};

	constructor(props: object) {
		super(props);

		this.state = {
			vertical: window.innerHeight > window.innerWidth,
			filters: [],
			pickingMode: false,
			pickingRule: false,
			editingIndex: -1,
			rodalWidth: window.innerWidth * 0.7,
			rodalHeight: window.innerHeight * 0.8
		};
		window.addEventListener("resize", () => this.setState({
			vertical: window.innerHeight > window.innerWidth,
			rodalWidth: window.innerWidth * 0.7, // used when horizontal
			rodalHeight: window.innerHeight * 0.8 // used when vertical
		}));
		window.addEventListener("weHaveFilters", (e: any) => this.setState({ filters: e.detail.filters }));
	}

	addNewFilter() {
		const filters = this.state.filters;
		filters.push({ mode: "any", rule: "ANY", maps: [], before: 0 });
		this.setState({ filters });
		this.updateFilters(filters);
	}

	togglePickingMode(index = -1) {
		this.setState({ pickingMode: !this.state.pickingMode, editingIndex: index });
	}

	togglePickingRule(index = -1) {
		this.setState({ pickingRule: !this.state.pickingRule, editingIndex: index });
	}

	setMode(mode: BattleMode) {
		if (this.state.editingIndex < 0) return this.setState({ pickingMode: false });
		const filters = this.state.filters;
		if (!filters[this.state.editingIndex]) return this.setState({ editingIndex: -1, pickingMode: false });
		filters[this.state.editingIndex].mode = mode;
		this.setState({ filters, pickingMode: false });
		this.updateFilters(filters);
	}

	setRule(rule: BattleRule) {
		if (this.state.editingIndex < 0) return this.setState({ pickingRule: false });
		const filters = this.state.filters;
		if (!filters[this.state.editingIndex]) return this.setState({ editingIndex: -1, pickingRule: false });
		filters[this.state.editingIndex].rule = rule;
		this.setState({ filters, pickingRule: false });
		this.updateFilters(filters);
	}

	setMap(index: number, slot: number, map: Stage) {
		if (slot < 0 || slot > 1 || index < 0) return;
		const filters = this.state.filters;
		if (!filters[index]) return;
		filters[index].maps[slot] = map;
		this.setState({ filters });
		this.updateFilters(filters);
	}

	setBefore(index: number, before: number) {
		const filters = this.state.filters;
		if (!filters[index]) return;
		filters[index].before = Math.round(before);//Math.round(before * 4) * 0.25;
		this.setState({ filters });
	}

	pushBeforeUpdate() {
		this.updateFilters(this.state.filters);
	}

	updateFilters(filters: RotaficationFilter[]) {
		window.dispatchEvent(new CustomEvent("weUpdateFilters", { detail: { filters } }));
	}

	render() {
		const rows: React.ReactNode[] = [];
		for (let ii = 0; ii < this.state.filters.length; ii++) {
			const filter = this.state.filters[ii];
			let modeNode = <img src={`assets/images/modes/${filter.mode}.svg`} className="img-clickable" onClick={() => this.togglePickingMode(ii)} />;
			let ruleNode = <img src={`assets/images/rules/${filter.rule.toLowerCase()}.svg`} className="img-clickable" onClick={() => this.togglePickingRule(ii)} />;
			let map1Node/*: React.ReactNode;
			if (!filter.maps[0]) map1Node = <div>?</div>;
			else map1Node*/ = <MapPicker value={filter.maps[0] || "Any"} onChange={s => this.setMap(ii, 0, s)} />;
			let map2Node/*: React.ReactNode;
			if (!filter.maps[1]) map2Node = <div>?</div>;
			else map2Node*/ = <MapPicker value={filter.maps[1] || "Any"} onChange={s => this.setMap(ii, 1, s)} />;
			if (this.state.vertical) {
				rows.push(<>
					<tr className="borderless">
						<td><div className="whatever flex flex-hcenter flex-vcenter">{modeNode}</div></td>
						<td><div className="whatever flex flex-hcenter flex-vcenter">{ruleNode}</div></td>
					</tr>
					<tr className="borderless">
						<td colSpan={2}>
							<div className="flex flex-hcenter">
								<div className="whatever flex flex-hcenter flex-vcenter">{map1Node}</div>
								<div className="whatever flex flex-hcenter flex-vcenter">{map2Node}</div>
							</div>
						</td>
					</tr>
					<tr>
						<td colSpan={2}>
							<div className="flex flex-hcenter flex-vcenter" style={{ marginBottom: "1rem" }}>
								<span className="input-hours">Before </span>
								<div><input className="input-hours" type="number" step={1} min={0} max={24} value={filter.before} onChange={(e) => this.setBefore(ii, Number(e.target.value))} onBlur={() => this.pushBeforeUpdate()} /></div>
								<span className="input-hours"> Hours</span></div>
						</td>
					</tr>
				</>);
			} else {
				rows.push(<tr key={ii}>
					<td><div className="whatever flex flex-hcenter flex-vcenter">{modeNode}</div></td>
					<td><div className="whatever flex flex-hcenter flex-vcenter">{ruleNode}</div></td>
					<td>
						<div className="flex flex-hcenter">
							<div className="whatever flex flex-hcenter flex-vcenter">{map1Node}</div>
							<div className="whatever flex flex-hcenter flex-vcenter">{map2Node}</div>
						</div>
					</td>
					<td><div className="flex flex-hcenter flex-vcenter">
						<div><input className="input-hours" type="number" step={1} min={0} max={24} value={filter.before} onChange={(e) => this.setBefore(ii, Number(e.target.value))} onBlur={() => this.pushBeforeUpdate()} /><span className="input-hours">Hours</span></div>
					</div></td>
				</tr>);
			}
		}
		let tableNode: React.ReactNode;
		let slidingNode: React.ReactNode;
		if (this.state.vertical) {
			tableNode = <table>
				<colgroup>
					<col span={1} style={{ width: "50%" }} />
					<col span={1} style={{ width: "50%" }} />
				</colgroup>
				<tbody>
					{rows}
					<tr><td colSpan={2}><div className="whatever flex flex-hcenter flex-vcenter"><div className="clickable" onClick={() => this.addNewFilter()}>+</div></div></td></tr>
				</tbody>
			</table>
			const rodalWidth = this.state.rodalHeight * 2 / 3;
			let width = rodalWidth;
			let height = this.state.rodalHeight;
			if (rodalWidth > window.innerWidth) {
				width = this.state.rodalWidth * 1.25;
				height = width * 3 / 2;
			}
			slidingNode = <>
			<Rodal
				width={width}
				height={height}
				visible={this.state.pickingMode}
				onClose={() => this.togglePickingMode()}
				closeOnEsc
				showCloseButton={false}
				animation="tv"
				className="about"
			>
				<div className="about-border"></div>
				<div className="about-background"></div>
				<div className="flex">
					<img src={`assets/images/modes/any.svg`} className="img-clickable option" onClick={() => this.setMode("any")} />
					<img src={`assets/images/modes/regular.svg`} className="img-clickable option" onClick={() => this.setMode("regular")} />
				</div>
				<div className="flex">
					<img src={`assets/images/modes/bankara.svg`} className="img-clickable option" onClick={() => this.setMode("bankara")} />
					<img src={`assets/images/modes/x.svg`} className="img-clickable option" onClick={() => this.setMode("x")} />
				</div>
				<div className="flex">
					<img src={`assets/images/modes/event.svg`} className="img-clickable option" onClick={() => this.setMode("event")} />
					<img src={`assets/images/modes/fest.svg`} className="img-clickable option" onClick={() => this.setMode("fest")} />
				</div>
			</Rodal>
			<Rodal
				width={width}
				height={height}
				visible={this.state.pickingRule}
				onClose={() => this.togglePickingRule()}
				closeOnEsc
				showCloseButton={false}
				animation="tv"
				className="about"
			>
				<div className="about-border"></div>
				<div className="about-background"></div>
				<div className="flex">
					<img src={`assets/images/rules/any.svg`} className="img-clickable option" onClick={() => this.setRule("ANY")} />
					<img src={`assets/images/rules/turf_war.svg`} className="img-clickable option" onClick={() => this.setRule("TURF_WAR")} />
				</div>
				<div className="flex">
					<img src={`assets/images/rules/area.svg`} className="img-clickable option" onClick={() => this.setRule("AREA")} />
					<img src={`assets/images/rules/loft.svg`} className="img-clickable option" onClick={() => this.setRule("LOFT")} />
				</div>
				<div className="flex">
					<img src={`assets/images/rules/goal.svg`} className="img-clickable option" onClick={() => this.setRule("GOAL")} />
					<img src={`assets/images/rules/clam.svg`} className="img-clickable option" onClick={() => this.setRule("CLAM")} />
				</div>
			</Rodal>
		</>
		} else {
			tableNode = <table>
				<colgroup>
					<col span={1} style={{ width: "10%" }} />
					<col span={1} style={{ width: "10%" }} />
					<col span={1} style={{ width: "70%" }} />
					<col span={1} style={{ width: "10%" }} />
				</colgroup>
				<tbody>
					<tr><th>Mode</th><th>Rule</th><th>Stage(s)</th><th>Before</th></tr>
					{rows}
					<tr><td colSpan={4}><div className="whatever flex flex-hcenter flex-vcenter"><div className="clickable" onClick={() => this.addNewFilter()}>+</div></div></td></tr>
				</tbody>
			</table>
			slidingNode = <>
				<Rodal
					width={this.state.rodalWidth}
					height={this.state.rodalWidth / 6}
					visible={this.state.pickingMode}
					onClose={() => this.togglePickingMode()}
					closeOnEsc
					showCloseButton={false}
					animation="tv"
					className="about"
				>
					<div className="about-border"></div>
					<div className="about-background"></div>
					<div className="flex">
						<img src={`assets/images/modes/any.svg`} className="img-clickable option" onClick={() => this.setMode("any")} />
						<img src={`assets/images/modes/regular.svg`} className="img-clickable option" onClick={() => this.setMode("regular")} />
						<img src={`assets/images/modes/bankara.svg`} className="img-clickable option" onClick={() => this.setMode("bankara")} />
						<img src={`assets/images/modes/x.svg`} className="img-clickable option" onClick={() => this.setMode("x")} />
						<img src={`assets/images/modes/event.svg`} className="img-clickable option" onClick={() => this.setMode("event")} />
						<img src={`assets/images/modes/fest.svg`} className="img-clickable option" onClick={() => this.setMode("fest")} />
					</div>
				</Rodal>
				<Rodal
					width={this.state.rodalWidth}
					height={this.state.rodalWidth / 6}
					visible={this.state.pickingRule}
					onClose={() => this.togglePickingRule()}
					closeOnEsc
					showCloseButton={false}
					animation="tv"
					className="about"
				>
					<div className="about-border"></div>
					<div className="about-background"></div>
					<div className="flex">
						<img src={`assets/images/rules/any.svg`} className="img-clickable option" onClick={() => this.setRule("ANY")} />
						<img src={`assets/images/rules/turf_war.svg`} className="img-clickable option" onClick={() => this.setRule("TURF_WAR")} />
						<img src={`assets/images/rules/area.svg`} className="img-clickable option" onClick={() => this.setRule("AREA")} />
						<img src={`assets/images/rules/loft.svg`} className="img-clickable option" onClick={() => this.setRule("LOFT")} />
						<img src={`assets/images/rules/goal.svg`} className="img-clickable option" onClick={() => this.setRule("GOAL")} />
						<img src={`assets/images/rules/clam.svg`} className="img-clickable option" onClick={() => this.setRule("CLAM")} />
					</div>
				</Rodal>
			</>
		}
		return <div className="card">
			<h1>Get notified when...</h1>
			{tableNode}
			{slidingNode}
		</div>
	}
}