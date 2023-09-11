import { Database } from "sqlite3";
import webpush from "web-push";
import { RotaficationFilter, BattleMode, BattleRule, Stage } from "../types/rotafication";
import { Splatoon3InkSchedules } from "../types/splatoon3ink";
import { MatchSetting } from "../types/splatoon3ink/vs_schedules";

const BATTLE_MODES: BattleMode[] = [
	"regular",
	"bankara",
	"x",
	"event",
	"fest"
];

const MODE_NAME_MAP: { [key: string]: string } = {
	regular: "Regular",
	bankara: "Anarchy",
	x: "X Battle",
	event: "Challenge",
	fest: "Splatfest"
};

const RULE_NAME_MAP: { [key: string]: string } = {
	TURF_WAR: "Turf War",
	AREA: "Splat Zones",
	LOFT: "Tower Control",
	GOAL: "Rainmaker",
	CLAM: "Clam Blitz"
};

export function notify(db: Database, schedules: Splatoon3InkSchedules) {
	const isEvenHour = !(new Date().getHours() % 2);
	db.all("SELECT * FROM users WHERE notif_endpoint IS NOT NULL", (err, rows: { id: string, filters: string, notif_endpoint: string, notif_auth: string, notif_p256dh: string }[]) => {
		if (err) return console.error(err);
		for (const row of rows) {
			const subscription = {
				endpoint: row.notif_endpoint,
				keys: {
					auth: row.notif_auth,
					p256dh: row.notif_p256dh
				}
			};
			for (const filter of <RotaficationFilter[]>JSON.parse(row.filters)) {
				if (isEvenHour && filter.before % 2) continue;
				const index = Math.floor((filter.before + 1) * 0.5);
				let title = "A map-mode combination you're looking for is happening ";
				if (!filter.before) title += "right now!";
				else title += `in ${filter.before} hours!`;
				let notify = false;
				const modes: BattleMode[] = [];
				const rules: BattleRule[] = [];
				const maps = new Set<Stage>();
				for (const mode of BATTLE_MODES)
					if (matchNode(mode, schedules.regularSchedules.nodes[index].regularMatchSetting, filter)) {
						notify = true;
						modes.push(mode);
						rules.push(schedules.regularSchedules.nodes[index].regularMatchSetting!.vsRule.rule);
						for (const stage of schedules.regularSchedules.nodes[index].regularMatchSetting!.vsStages)
							maps.add(stage.name);
					}
				if (notify) {
					let body = "";
					body += `Mode(s): ${modes.map(m => MODE_NAME_MAP[m]).join(", ")}\n`;
					body += `Rule(s): ${rules.map(m => RULE_NAME_MAP[m]).join(", ")}\n`;
					const mapArr = Array.from(maps);
					body += `Maps: ${mapArr.join(", ")}`;
					const payload = JSON.stringify({
						title,
						body,
						icon: "/assets/images/zoomin.png",
						image: `/get-thumb/${mapArr[Math.floor(Math.random() * mapArr.length)]}`
					});
					webpush.sendNotification(subscription, payload);
				}
			}
		}
	});
}

export async function ungrantedNotify(db: Database, schedules: Splatoon3InkSchedules, id: string) {
	const isEvenHour = !(new Date().getHours() % 2);
	return new Promise((res, rej) => {
		db.get("SELECT (id, filters) FROM users WHERE id = ?", id, (err, row: { id: string, filters: string }) => {
			if (err) return rej(err);
			for (const filter of <RotaficationFilter[]>JSON.parse(row.filters)) {
				if (isEvenHour && filter.before % 2) continue;
				const index = Math.floor((filter.before + 1) * 0.5);
				let title = "A map-mode combination you're looking for is happening ";
				if (!filter.before) title += "right now!";
				else title += `in ${filter.before} hours!`;
				let notify = false;
				const modes: BattleMode[] = [];
				const rules: BattleRule[] = [];
				const maps = new Set<Stage>();
				for (const mode of BATTLE_MODES)
					if (matchNode(mode, schedules.regularSchedules.nodes[index].regularMatchSetting, filter)) {
						notify = true;
						modes.push(mode);
						rules.push(schedules.regularSchedules.nodes[index].regularMatchSetting!.vsRule.rule);
						for (const stage of schedules.regularSchedules.nodes[index].regularMatchSetting!.vsStages)
							maps.add(stage.name);
					}
				if (notify) {
					let body = "";
					body += `Mode(s): ${modes.map(m => MODE_NAME_MAP[m]).join(", ")}\n`;
					body += `Rule(s): ${rules.map(m => RULE_NAME_MAP[m]).join(", ")}\n`;
					const mapArr = Array.from(maps);
					body += `Maps: ${mapArr.join(", ")}`;
					res({
						title,
						body,
						icon: "/assets/images/zoomin.png",
						image: `/get-thumb/${mapArr[Math.floor(Math.random() * mapArr.length)]}`
					});
				} else res(undefined);
			}
		});
	});
}

function matchNode(mode: BattleMode, setting: MatchSetting | undefined, filter: RotaficationFilter) {
	if (!setting) return false;
	if (filter.mode !== "any" && filter.mode !== mode) return false;
	if (filter.rule !== "ANY" && filter.rule !== setting.vsRule.rule) return false;
	const names = setting.vsStages.map(s => s.name);
	return (filter.maps[0] ? names.includes(filter.maps[0]) : true) && (filter.maps[1] ? names.includes(filter.maps[1]) : true);
}