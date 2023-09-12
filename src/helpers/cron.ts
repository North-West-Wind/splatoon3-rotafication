import Cron from "croner";
import fetch from "node-fetch";
import * as fs from "fs";
import sanitize from "sanitize-filename";
import { Splatoon3InkSchedules, Splatoon3InkSchedulesResponse } from "../types/splatoon3ink";
import { notify } from "./notifier";
import { db } from "..";
import { FestMatchSetting } from "../types/splatoon3ink/vs_schedules";

// Stage thumbnail cache setup
if (!fs.existsSync("public/cache")) fs.mkdirSync("public/cache");

let cachedSchedules: Splatoon3InkSchedules;
// One second buffer to make sure splatoon3.ink has updated
//    v
Cron("1 0 * * * *", cronJob);
cronJob(true); // change this back to true after debugging

async function cronJob(forced = false) {
	const isEvenHour = !(new Date().getHours() % 2);
	const res = await fetch("https://splatoon3.ink/data/schedules.json");
	if (res.ok) {
		if (isEvenHour || !cachedSchedules) {
			console.log("Updating schedules");
			const data = (<Splatoon3InkSchedulesResponse>await res.json()).data;
			const transformed: any = { ...data, bankaraSchedules: undefined, festSchedules: undefined };
			transformed.bankaraChallengeSchedules = { nodes: data.bankaraSchedules.nodes.map(n => ({
				...n,
				bankaraMatchSettings: undefined,
				bankaraChallengeMatchSetting: n.bankaraMatchSettings ? n.bankaraMatchSettings.find(s => s.bankaraMode === "CHALLENGE") : undefined
			})) };
			transformed.bankaraOpenSchedules = { nodes: data.bankaraSchedules.nodes.map(n => ({
				...n,
				bankaraMatchSettings: undefined,
				bankaraOpenMatchSetting: n.bankaraMatchSettings ? n.bankaraMatchSettings.find(s => s.bankaraMode === "OPEN") : undefined
			})) };
			transformed.festChallengeSchedules = { nodes: data.festSchedules.nodes.map(n => ({
				...n,
				festMatchSettings: undefined,
				festChallengeMatchSetting: n.festMatchSettings ? (<FestMatchSetting[]>n.festMatchSettings).find(s => s.festMode === "CHALLENGE") : undefined
			})) };
			transformed.festRegularSchedules = { nodes: data.festSchedules.nodes.map(n => ({
				...n,
				festMatchSettings: undefined,
				festRegularMatchSetting: n.festMatchSettings ? (<FestMatchSetting[]>n.festMatchSettings).find(s => s.festMode === "REGULAR") : undefined
			})) };
			cachedSchedules = transformed;
			for (const stage of data.vsStages.nodes) {
				const filename = sanitize(stage.name.toLowerCase().replace(/ /g, "_")) + ".png";
				if (!fs.existsSync(`public/cache/${filename}`)) {
					const url = stage.originalImage.url.replace("high", "low").replace("0.png", "1.png");
					console.log("Caching", url, "as", filename);
					const resp = await fetch(url);
					if (!resp.ok) continue;
					try {
						fs.writeFileSync(`public/cache/${filename}`, await resp.buffer());
					} catch (err) {
						console.error(err);
					}
				}
			}
		}
		if (!forced) notify(db, cachedSchedules);
	}
}

export function getSchedules() {
	return cachedSchedules;
}