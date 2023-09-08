import React from "react";

export default class Configuration extends React.Component {
	render() {
		return <div className="card">
			<h1>Get notified when...</h1>
			<table>
		    <colgroup>
		       <col span={1} style={{ width: "15%" }} />
		       <col span={1} style={{ width: "15%" }} />
		       <col span={1} style={{ width: "70%" }} />
		    </colgroup>
				<tbody>
					<tr><th>Battle Mode</th><th>Game Mode</th><th>Stage(s)</th></tr>
					<tr>
						<td><div className="whatever flex flex-hcenter flex-vcenter"><div>?</div></div></td>
						<td><div className="whatever flex flex-hcenter flex-vcenter"><div>?</div></div></td>
						<td>
							<div className="flex flex-hcenter">
								<div className="whatever flex flex-hcenter flex-vcenter"><div>?</div></div>
								<div className="whatever flex flex-hcenter flex-vcenter"><div>?</div></div>
							</div>
						</td>
					</tr>
					<tr><td colSpan={3}><div className="whatever flex flex-hcenter flex-vcenter"><div>+</div></div></td></tr>
				</tbody>
			</table>
		</div>
	}
}