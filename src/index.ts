import bodyParser from "body-parser";
import { CronJob } from "cron";
import "dotenv/config";
import express from "express";
import * as fs from "fs";
import fetch from "node-fetch";
import path from "path";
import webpush from "web-push";
import { Splatoon3InkSchedules, Splatoon3InkSchedulesResponse } from "./types/splatoon3ink";
import sanitize from "sanitize-filename";
import { verbose } from "sqlite3";
import { deepEquality } from "@santi100/equal-lib";
import { notify, ungrantedNotify } from "./helpers/notifier";
import { getId } from "./helpers/express";
import { createUser, deleteSubscription, getRow, updateFilters, updateSubscription, userExists } from "./helpers/database";
import { Cron } from "croner";
const sqlite3 = verbose();

// Stage thumbnail cache setup
if (!fs.existsSync("public/cache")) fs.mkdirSync("public/cache");

// Cron job setup
let cachedSchedules: Splatoon3InkSchedules;
// One second buffer to make sure splatoon3.ink has updated
//           v
Cron("1 0 * * * *", async () => {
	const isEvenHour = !(new Date().getHours() % 2);
	const res = await fetch("https://splatoon3.ink/data/schedules.json");
	if (res.ok) {
		if (isEvenHour) {
			const data = (<Splatoon3InkSchedulesResponse>await res.json()).data;
			if (!cachedSchedules) cachedSchedules = data;
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
		notify(db, cachedSchedules);
	}
});

// Database setup
const db = new sqlite3.Database("users.db");
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
	if (err) throw err;
	if (!row) db.run("CREATE TABLE users (id CHAR(8) PRIMARY KEY, filters JSON NOT NULL, notif_endpoint VARCHAR(255), notif_auth VARCHAR(255), notif_p256dh VARCHAR(255))");
});

// Web push setup
webpush.setVapidDetails(
	process.env.DOMAIN!,
	process.env.PUBLIC_VAPID_KEY!,
	process.env.PRIVATE_VAPID_KEY!
);

// Express setup
const app = express();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req, res, next): void => {
	try {
		res.send("index.html");
	} catch (error) {
		next(error);
	}
});

const jsonParser = bodyParser.json();

// Retrieve thumbnail
app.get('/get-thumb/:map', async (req, res) => {
	const filename = `${sanitize(req.params.map.toLowerCase().replace(/ /g, "_"))}.png`;
	if (fs.existsSync(`public/cache/${filename}`)) res.sendFile(path.resolve(".", `public/cache/${filename}`));
	else res.sendFile(path.resolve(".", "public/assets/images/uncached-filler.png"));
});

// Subscriptions
app.post("/subscribe", jsonParser, async (req, res) => {
	const id = getId(req, res);
	if (!id) return;
	const subscription = <webpush.PushSubscription>req.body.subscription;
	try {
		if (!(await userExists(db, id))) await createUser(db, id, { subscription });
		else await updateSubscription(db, id, subscription);
		res.json({ success: true });
		const payload = JSON.stringify({
			title: "Testing... 1, 2, 3!",
			body: "It looks like push notification is working!",
			icon: "/assets/images/zoomin.png"
		});
		webpush.sendNotification(subscription, payload);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

app.delete("/subscribe", async (req, res) => {
	const id = getId(req, res);
	if (!id) return;
	try {
		if (!(await userExists(db, id))) res.status(404).json({ success: false, error: "User not found" });
		else {
			await deleteSubscription(db, id);
			res.json({ success: true });
		}
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

app.get("/should-notify", async (req, res) => {
	const id = getId(req, res);
	if (!id) return;
	try {
		if (!(await userExists(db, id))) res.status(404).json({ success: false, error: "User not found" });
		else res.json({ success: true, notif: await ungrantedNotify(db, cachedSchedules, id) });
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Database
const ID_LENGTH = 12;
app.get("/filters", async (req, res) => {
	const id = getId(req, res);
	if (!id) return;
	try {
		const row = <{ filters: string, notif_endpoint?: string }>await getRow(db, id, ["filters", "notif_endpoint"]);
		if (!row) res.json({ success: true, filters: [], notif: false });
		else res.json({ success: true, filters: JSON.parse(row.filters), notif: !!row.notif_endpoint });
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

app.post("/filters", jsonParser, async (req, res) => {
	const id = getId(req, res);
	if (!id) return;
	const filters = req.body.filters;
	if (!Array.isArray(filters)) return res.status(400).json({ success: false, error: "Invalid filters" });
	try {
		const row = <{ filters: any[] }>await getRow(db, id, ["filters"]);
		if (!row) await createUser(db, id, { filters: JSON.stringify(filters) });
		else if (!deepEquality(filters, row.filters)) await updateFilters(db, id, JSON.stringify(filters));
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`)
});