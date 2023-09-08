import React from "react"

type Property = {
	hidden: boolean
}

const About: React.FC<Property> = (props: Property) => {
	return <div className="about" style={props.hidden ? { visibility: "hidden", opacity: 0 } : {}}>
		<div className="about-background"></div>
		<h1>Rota-fication</h1>
		<h2>A Splatoon 3 maps and modes rotation update notifier</h2>
		<img src="assets/images/icon.gif" />
		<h2 style={{ marginBottom: 0 }}>Made by NorthWestWind</h2>
		<a href="https://github.com/North-West-Wind/splatoon3-rotafication" target="github">Source code on Github</a>
	</div>
}

export default About;