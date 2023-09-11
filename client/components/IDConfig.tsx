import Cookies from "js-cookie";
import React from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { askPermission, subscribeUserToPush } from "../helpers/subscription";
import Rodal from "rodal";

const ID_LENGTH = 12;

export default class IDConfig extends React.Component {
	state: {
		id: string,
		tmpId?: string,
		hasCookies: boolean,
		canNotification: boolean,
		hasNotification: boolean,
		subscribing: boolean, // prevent toggle spam
		subscribed: boolean,
		notification?: any
	};

	constructor(props: object) {
		super(props);

		if (Cookies.get("gave_me_cookies") && Cookies.get("id")) this.state = {
			id: Cookies.get("id")!,
			hasCookies: true,
			canNotification: 'serviceWorker' in navigator && 'PushManager' in window,
			hasNotification: Notification.permission === "granted",
			subscribing: false,
			subscribed: false
		};
		else this.state = {
			id: Math.random().toString(16).slice(2, ID_LENGTH + 2),
			hasCookies: !!Cookies.get("gave_me_cookies"),
			canNotification: 'serviceWorker' in navigator && 'PushManager' in window,
			hasNotification: Notification.permission === "granted",
			subscribing: false,
			subscribed: false
		};
		this.updateFilters(this.state.id);
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
		window.addEventListener("weHaveNotif", (e: any) => {
			this.setState({ notification: e.detail.payload });
			new Audio("/assets/sounds/notif.wav").play();
		});
		window.addEventListener("weNeedNotif", async () => {
			if (this.state.subscribed) return;
			try {
				const res = await fetch("/should-notify", { headers: { "Authorization": "Bearer " + this.state.id } });
				if (res.ok) {
					this.setState({ notification: (await res.json()).notif });
					new Audio("/assets/sounds/notif.wav").play();
				}
			} catch (err) { console.error(err); }
		});
	}

	changeId(tmpId: string) {
		this.setState({ tmpId });
	}

	sync() {
		const id = this.state.tmpId || this.state.id;
		if (!/^[\w\d]{12}$/.test(id)) return this.setState({ tmpId: undefined });
		this.setState({ id, tmpId: undefined });
		if (this.state.hasCookies) Cookies.set("id", id);
		this.updateFilters(id);
	}

	async updateFilters(id: string) {
		try {
			const res = await fetch(`/filters`, { headers: { "Authorization": "Bearer " + id } });
			if (res.ok) {
				const data = await res.json();
				window.dispatchEvent(new CustomEvent("weHaveFilters", { detail: { filters: data.filters } }));
				this.setState({ subscribed: data.notif });
			}
		} catch (err) { console.error(err); }
	}

	async toggleNotification() {
		if (this.state.subscribing) return;
		this.setState({ subscribing: true });
		if (!this.state.subscribed) {
			if (!this.state.hasNotification) {
				const result = await askPermission();
				this.setState({ hasNotification: result });
				if (!result) return this.setState({ subscribing: false });
			}
			try {
				const subscription = await subscribeUserToPush(process.env.REACT_APP_PUBLIC_VAPID_KEY!);
				const res = await fetch("/subscribe", {
					method: 'POST',
			    headers: {
						"Authorization": "Bearer " + this.state.id,
			      'Content-Type': 'application/json',
			    },
			    body: JSON.stringify({ subscription }),
				});
				if (res.ok) this.setState({ subscribed: true });
			} catch (err) { console.error(err); }
			this.setState({ subscribing: false });
		} else {
			try {
				const res = await fetch("/subscribe", {
					method: 'DELETE',
			    headers: { "Authorization": "Bearer " + this.state.id }
				});
				if (res.ok) this.setState({ subscribed: false });
			} catch (err) { console.error(err); }
			this.setState({ subscribing: false });
		}
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
			<div className="flex flex-vcenter">
				{this.state.canNotification && <>
					<Toggle className="toggle" checked={this.state.subscribed} onChange={() => this.toggleNotification()} />
					<span className="toggle-label">Notifications</span>
				</>}
				<div className="button sync" onClick={() => this.sync()}>Sync</div>
			</div>
			<Rodal
				visible={this.state.notification}
				onClose={() => this.setState({ notification: undefined })}
				animation="tv"
				className="about"
			>
				<div className="about-border"></div>
				<div className="about-background"></div>
				<div className="flex flex-hcenter flex-vcenter" style={{ height: "100%", overflowY: "scroll" }}>
					<div style={{ height: "100%" }}>
						<h1>BATTLE TIME!</h1>
					</div>
				</div>
			</Rodal>
		</div>
	}
}