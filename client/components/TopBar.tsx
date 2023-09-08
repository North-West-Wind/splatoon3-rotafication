import React from "react";
import ReactSlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import About from "./About";

export default class TopBar extends React.Component {
	state: { aboutOpened: boolean };

	constructor(props: object) {
		super(props);

		this.state = { aboutOpened: false };
	}

	toggleAboutOpened() {
		this.setState({ aboutOpened: !this.state.aboutOpened });
	}
	
	render(): React.ReactNode {
		return <div className="topbar">
			<div className="flex flex-vcenter banner">
				<h1>Rota-fication</h1>
				<h2 onClick={() => this.toggleAboutOpened()}>ℹ️</h2>
			</div>
			<About hidden={!this.state.aboutOpened} />
		</div>
	}
}