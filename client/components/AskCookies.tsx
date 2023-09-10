import Cookies from "js-cookie";
import React from "react";
import Rodal from "rodal";
import 'rodal/lib/rodal.css';
import "./css/rodal.css";

export default class AskCookies extends React.Component {
	state: { hasCookies: boolean, answered: boolean, rodalWidth: number, rodalHeight: number };

	constructor(props: object) {
		super(props);

		this.state = {
			hasCookies: !!Cookies.get("gave_me_cookies"),
			answered: !!Cookies.get("gave_me_cookies"),
			rodalWidth: window.innerWidth * 0.7,
			rodalHeight: window.innerHeight * 0.8
		};
		window.addEventListener("resize", () => this.setState({ rodalWidth: window.innerWidth * 0.7, rodalHeight: window.innerHeight * 0.8 }));
		window.addEventListener("weNeedCookies", () => this.setState({ answered: false }));
	}

	answer(granted: boolean) {
		if (granted) {
			Cookies.set("gave_me_cookies", "1");
			window.dispatchEvent(new Event("weHaveCookies"));
		}
		this.setState({ hasCookies: granted, answered: true });
	}

	render() {
		return <Rodal
			width={this.state.rodalWidth}
			height={this.state.rodalHeight}
			onClose={() => this.answer(false)}
			visible={!this.state.answered}
			showCloseButton={false}
			animation="tv"
			className="about"
		>
			<div className="about-border"></div>
			<div className="about-background"></div>
			<div className="flex flex-hcenter flex-vcenter" style={{ height: "100%", overflowY: "scroll" }}>
				<div style={{ height: "100%" }}>
					<h1>Can you give me cookies?</h1>
					<img src="assets/images/cookies.jpg" className="cookies" />
					<h2 style={{ margin: 0 }}>We store ONE SINGULAR item with cookies:</h2>
					<h2 style={{ margin: 0 }}>Your (random) ID</h2>
					<h2 style={{ margin: 0 }}>The ID is used for keeping track of what filters you've set up, so you can receive notifications on multiple devices.</h2>
					<div className="flex flex-hcenter flex-vcenter">
						<div className="button cookies" onClick={() => this.answer(true)}>Accept</div>
						<div className="button cookies" onClick={() => this.answer(false)}>Deny</div>
					</div>
				</div>
			</div>
		</Rodal>
	}
}