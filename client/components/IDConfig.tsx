import Cookies from "js-cookie";
import React from "react";

const ID_LENGTH = 12;

export default class IDConfig extends React.Component {
	state: { id: string, tmpId?: string, hasCookies: boolean };

	constructor(props: object) {
		super(props);

		if (Cookies.get("gave_me_cookies") && Cookies.get("id")) this.state = { id: Cookies.get("id")!, hasCookies: true };
		else this.state = { id: Math.random().toString(16).slice(2, ID_LENGTH + 2), hasCookies: !!Cookies.get("gave_me_cookies") };
		this.updateFilters();
		window.addEventListener("weHaveCookies", () => {
			this.setState({ hasCookies: true });
			Cookies.set("id", this.state.id);
		});
		window.addEventListener("weUpdateFilters", async (e: any) => {
			const filters = e.detail.filters;
			try {
				await fetch("/filters", { headers: { "Authorization": "Bearer " + this.state.id, "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ filters }) });
			} catch (err) { console.error(err); }
		});
	}

	changeId(tmpId: string) {
		this.setState({ tmpId });
	}

	sync() {
		if (!this.state.tmpId) return;
		if (!/^[\w\d]{12}$/.test(this.state.tmpId)) return this.setState({ tmpId: undefined });
		const tmpId = this.state.tmpId;
		this.setState({ id: tmpId, tmpId: undefined });
		if (this.state.hasCookies) Cookies.set("id", tmpId);
		this.updateFilters();
	}

	async updateFilters() {
		try {
			const res = await fetch(`/filters`, { headers: { "Authorization": "Bearer " + this.state.id } });
			if (res.ok) window.dispatchEvent(new CustomEvent("weHaveFilters", { detail: { filters: (await res.json()).filters } }));
		} catch (err) { console.error(err); }
	}
	
	render() {
		return <div className="card">
			<h1 style={{ marginBottom: 0 }}>Your ID</h1>
			<h2 style={{ margin: 0, lineHeight: "2rem" }}>This can sync the filters across devices!</h2>
			<h2 style={{ marginTop: 0, lineHeight: "2rem" }}>If you have one, you may put it in here.</h2>
			{!this.state.hasCookies && <h2 style={{ marginTop: 0, lineHeight: "2rem", color: "#ff7f7f" }}>(You didn't give me cookies! This ID won't be stored in your browser.)</h2>}
			<div className="flex">
				<input type="text" className="input-id" value={this.state.tmpId || this.state.id} onChange={(e) => this.changeId(e.target.value)} />
			</div>
			<div className="flex">
				<div className="button sync" onClick={() => this.sync()}>Sync</div>
			</div>
		</div>
	}
}