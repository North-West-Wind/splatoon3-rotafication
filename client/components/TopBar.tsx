import React from "react";
import Rodal from "rodal";
import 'rodal/lib/rodal.css';
import "./css/rodal.css";
import About from "./About";

export default class TopBar extends React.Component {
	state: { aboutOpened: boolean, rodalWidth: number, rodalHeight: number };

	constructor(props: object) {
		super(props);

		this.state = { aboutOpened: false, rodalWidth: window.innerWidth * 0.7, rodalHeight: window.innerHeight * 0.8 };
		window.addEventListener("resize", () => this.setState({ rodalWidth: window.innerWidth * 0.7, rodalHeight: window.innerHeight * 0.8 }));
		window.addEventListener("weNeedCookies", () => this.setState({ aboutOpened: false }));
	}

	toggleAboutOpened() {
		this.setState({ aboutOpened: !this.state.aboutOpened });
	}
	
	render(): React.ReactNode {
		return <div className="topbar">
			<div className="flex flex-vcenter banner">
				<h1>Rota-fication</h1>
				<h2 onClick={() => this.toggleAboutOpened()}>ℹ️ Info</h2>
			</div>
			<Rodal
				width={this.state.rodalWidth}
				height={this.state.rodalHeight}
				onClose={() => this.toggleAboutOpened()}
				visible={this.state.aboutOpened}
				showCloseButton={false}
				animation="tv"
				className="about"
			>
				<About />
			</Rodal>
		</div>
	}
}