import { Database } from "sqlite3";
import webpush from "web-push";
import { RotaficationFilter, BattleMode, BattleRule, Stage } from "../types/rotafication";
import { Splatoon3InkSchedules } from "../types/splatoon3ink";
import { MatchSetting } from "../types/splatoon3ink/vs_schedules";
import { Payload } from "../types/rotafication/notifier";

type ExtraBattleMode = BattleMode | "bankaraChallenge" | "bankaraOpen" | "festChallenge" | "festRegular";

const BATTLE_MODES: ExtraBattleMode[] = [
	"regular",
	"bankaraChallenge",
	"bankaraOpen",
	"x",
	"festChallenge",
	"festRegular"
];

const MODE_NAME_MAP: { [key: string]: string } = {
	regular: "Regular",
	bankaraChallenge: "Anarchy Series",
	bankaraOpen: "Anarchy Open",
	x: "X Battle",
	event: "Challenge",
	festChallenge: "Splatfest Pro",
	festRegular: "Splatfest Open"
};

const RULE_NAME_MAP: { [key: string]: string } = {
	TURF_WAR: "Turf War",
	AREA: "Splat Zones",
	LOFT: "Tower Control",
	GOAL: "Rainmaker",
	CLAM: "Clam Blitz"
};

const HOUR_MS = 60 * 60 * 1000;

const notificationCache = new Map<string, Payload[]>();

export function notify(db: Database, schedules: Splatoon3InkSchedules) {
	db.all("SELECT id, filters FROM users WHERE notif = 1", (err, rows: { id: string, filters: string }[]) => {
		if (err) return console.error(err);
		if (!rows.length) return;
		db.all("SELECT * FROM subscriptions WHERE " + rows.map(r => `user_id = "${r.id}"`).join(" OR "), (err, subRows: { id: string, user_id: string, endpoint: string, auth: string, p256dh: string }[]) => {
			if (err) return console.error(err);
			for (const row of rows) {
				const subscriptions = subRows.filter(r => r.user_id === row.id).map(r => ({
					id: r.id,
					endpoint: r.endpoint,
					keys: {
						auth: r.auth,
						p256dh: r.p256dh
					}
				}));
				const payloads: Payload[] = [];
				for (const filter of <RotaficationFilter[]>JSON.parse(row.filters)) {
					const payload = getPayload(schedules, filter);
					if (payload) {
						for (const sub of subscriptions) webpush.sendNotification(sub, JSON.stringify(payload))
							.catch(() => db.run("DELETE FROM subscriptions WHERE id = ?", sub.id)); // Subscription died
						payloads.push(payload);
					}
				}
				notificationCache.set(row.id, payloads);
			}
		});
	});
}

export async function ungrantedNotify(db: Database, schedules: Splatoon3InkSchedules, id: string) {
	return new Promise((res, rej) => {
		if (notificationCache.has(id)) {
			const payloads = notificationCache.get(id);
			notificationCache.delete(id);
			return res(payloads);
		}
		db.get("SELECT id, filters FROM users WHERE id = ?", id, (err, row: { id: string, filters: string }) => {
			if (err) return rej(err);
			const payloads: Payload[] = [];
			for (const filter of <RotaficationFilter[]>JSON.parse(row.filters)) {
				const payload = getPayload(schedules, filter);
				if (payload) payloads.push(payload);
			}
			res(payloads);
		});
	});
}

function getPayload(schedules: Splatoon3InkSchedules, filter: RotaficationFilter): Payload | undefined {
	const isEvenHour = !(new Date().getHours() % 2);
	if (isEvenHour && filter.before % 2) return undefined;
	else if (!isEvenHour && !(filter.before % 2)) return undefined;
	const index = Math.floor((filter.before + 1) * 0.5);
	let title = "BATTLE TIME";
	if (!filter.before) title += "!";
	else title += ` in ${filter.before} hours!`;
	let notify = false;
	const modes: ExtraBattleMode[] = [];
	const rules = new Set<BattleRule>();
	const maps = new Set<Stage>();
	// Checking for every mode except challenge
	for (const mode of BATTLE_MODES) {
		if (!(<any>schedules)[mode + "Schedules"].nodes[index]) continue;
		let genericMode: string;
		if (mode.startsWith("bankara")) genericMode = "bankara";
		else if (mode.startsWith("fest")) genericMode = "fest";
		else genericMode = mode;
		if (matchNode(<BattleMode>genericMode, (<any>schedules)[mode + "Schedules"].nodes[index][mode + "MatchSetting"], filter)) {
			notify = true;
			modes.push(mode);
			rules.add((<any>schedules)[mode + "Schedules"].nodes[index][mode + "MatchSetting"].vsRule.rule);
			for (const stage of (<any>schedules)[mode + "Schedules"].nodes[index][mode + "MatchSetting"].vsStages)
				maps.add(stage.name);
		}
	}
	// Checking for challenge
	const now = new Date();
	for (const node of schedules.eventSchedules.nodes) {
		let inTime = false;
		for (const period of node.timePeriods) {
			const time = new Date(period.startTime);
			const diff = time.getTime() - now.getTime();
			if (diff > (filter.before - 1) * HOUR_MS && diff < filter.before * HOUR_MS) {
				inTime = true;
				break;
			}
		}
		if (inTime && matchNode("event", node.leagueMatchSetting, filter)) {
			notify = true;
			modes.push("event");
			rules.add(node.leagueMatchSetting.vsRule.rule);
			for (const stage of node.leagueMatchSetting.vsStages)
				maps.add(stage.name);
		}
	}
	if (notify) {
		let body = "";
		body += `Mode(s): ${modes.map(m => MODE_NAME_MAP[m]).join(", ")}\n`;
		body += `Rule(s): ${Array.from(rules).map(m => RULE_NAME_MAP[m]).join(", ")}\n`;
		const mapArr = Array.from(maps);
		body += `Maps: ${mapArr.join(", ")}`;
		return {
			title,
			body,
			icon: "/assets/images/icon.svg",
			image: `/get-thumb/${mapArr[Math.floor(Math.random() * mapArr.length)]}`,
			badge: "/assets/images/badge.svg",
			sound: "/assets/sounds/notif.wav"
		};
	} else return undefined;
}

function matchNode(mode: BattleMode, setting: MatchSetting | undefined, filter: RotaficationFilter) {
	if (!setting) return false;
	if (filter.mode !== "any" && filter.mode !== mode) return false;
	if (filter.rule !== "ANY" && filter.rule !== setting.vsRule.rule) return false;
	const names = setting.vsStages.map(s => s.name);
	return (filter.maps[0] ? (names.includes(filter.maps[0]) || filter.maps[0] === "Any") : true) && (filter.maps[1] ? (names.includes(filter.maps[1]) || filter.maps[1] === "Any") : true);
}