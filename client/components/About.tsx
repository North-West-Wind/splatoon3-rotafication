import Cookies from "js-cookie";
import React from "react";

export default class About extends React.Component {
	state: { hasCookies: boolean };

	constructor(props: object) {
		super(props);

		this.state = { hasCookies: !!Cookies.get("gave_me_cookies") };
		window.addEventListener("weHaveCookies", () => this.setState({ hasCookies: true }));
	}

	askForCookies() {
		window.dispatchEvent(new Event("weNeedCookies"));
	}

	render() {
		return <>
			<div className="about-border"></div>
			<div className="about-background"></div>
			<div className="flex flex-hcenter flex-vcenter" style={{ height: "100%", overflowY: "scroll" }}>
				<div style={{ height: "100%" }}>
					<h1>Rota-fication</h1>
					<h2>A Splatoon 3 maps and modes rotation update notifier</h2>
					<img src="assets/images/icon.svg" />
					<h2>Usage</h2>
					<p>Click on the huge "+" button to add a notification filter.</p>
					<p>Click on the "?" to select a mode and/or rule.</p>
					<p>To choose a map, use the dropdown menu.</p>
					<div className="flex flex-hcenter">
						<div className="flex flex-vcenter" style={{ width: "80%", marginTop: "1rem" }}>
							<div style={{ marginRight: "1rem", flex: 1 }}>
								<h2 style={{ marginBottom: 0 }}>Made by NorthWestWind</h2>
								<a href="https://github.com/North-West-Wind/splatoon3-rotafication" target="github">Source code on Github</a>
							</div>
							<img style={{ flex: 1 }} src="assets/images/icon.gif" className="icon" />
						</div>
					</div>
					{!this.state.hasCookies && <div className="flex flex-hcenter flex-vcenter">
						<div className="button" onClick={() => this.askForCookies()}>I ask for cookies</div>
					</div>}
				</div>
			</div>
		</>
	}
}