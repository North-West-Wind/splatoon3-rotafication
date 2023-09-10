import bodyParser from "body-parser";
import { CronJob } from "cron";
import "dotenv/config";
import express from "express";
import * as fs from "fs";
import fetch from "node-fetch";
import path from "path";
import webpush from "web-push";
import { Splatoon3InkSchedulesResponse } from "./types/splatoon3ink";
import isImageURL from "is-image-header";
import sanitize from "sanitize-filename";
import { verbose } from "sqlite3";
import { deepEquality } from "@santi100/equal-lib";
import { RotaficationFilter } from "./types/rotafication";
const sqlite3 = verbose();

// Stage thumbnail cache setup
if (!fs.existsSync("public/cache")) fs.mkdirSync("public/cache");

// Cron job setup
// One second buffer to make sure splatoon3.ink has updated
//                     v
new CronJob("* * * * 0 1", async () => {

	const res = await fetch("https://splatoon3.ink/data/schedules.json");
	if (res.ok) {
		const data = (<Splatoon3InkSchedulesResponse>await res.json()).data;
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
				const filtersData = <RotaficationFilter>JSON.parse(row.filters);

			}
		});
	}
}, null, true, undefined, null, true, 0);

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

// Thumbnail caching
app.post('/cache-thumb', jsonParser, async (req, res) => {
	const url = <string>req.body.url;
	const name = <string>req.body.name;
	if (!name) return res.status(400).json({ success: false, error: "No name provided" });
	if (!url?.startsWith("https://splatoon3.ink/assets/splatnet/v2/stage_img/icon/low_resolution/")) return res.status(400).json({ success: false, error: "Invalid URL" });
	const isImg = await isImageURL(url);
	if (!isImg.success) return res.status(500).json({ success: false, error: isImg.message });
	if (!isImg.isImage) return res.status(400).json({ success: false, error: "Invalid URL" });
	const resp = await fetch(url);
	if (!resp.ok) return res.status(resp.status).json({ success: false, error: resp.statusText });
	try {
		fs.writeFileSync(`public/cache/${sanitize(name.toLowerCase().replace(/ /g, "_"))}.png`, await resp.buffer());
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ success: false, error });
	}
});

// Retrieve thumbnail
app.get('/get-thumb/:map', async (req, res) => {
	const filename = `${sanitize(req.params.map.toLowerCase().replace(/ /g, "_"))}.png`;
	if (fs.existsSync(`public/cache/${filename}`)) res.sendFile(path.resolve(".", `public/cache/${filename}`));
	else res.sendFile(path.resolve(".", "public/assets/images/uncached-filler.png"));
});

// Subscriptions
app.post("/subscribe", jsonParser, (req, res) => {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return res.status(400).json({ success: false, error: "Invalid header" });
	const id = auth.split(" ")[1];
	if (!/^[\w\d]{12}$/.test(id)) return res.status(400).json({ success: false, error: "Invalid ID" });
	const subscription = <webpush.PushSubscription>req.body.subscription;
	db.get("SELECT id FROM users WHERE id = ?", id, (err, row: { id: string }) => {
		if (err) return res.status(500).json({ success: false, error: err.message });
		if (!row) db.run("INSERT INTO users VALUES (?, '[]', ?, ?, ?)", [id, subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh], err => {
			if (err) return res.status(500).json({ success: false, error: err.message });
			res.json({ success: true });
		});
		else db.run("UPDATE users SET notif_endpoint = ?, notif_auth = ?, notif_p256dh = ? WHERE id = ?", [subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh, id], err => {
			if (err) return res.status(500).json({ success: false, error: err.message });
			res.json({ success: true });
		});
	});
	const payload = JSON.stringify({
		title: "Testing... 1, 2, 3!",
		body: "It looks like push notification is working!"
	});
	webpush.sendNotification(subscription, payload);
});

app.delete("/subscribe", (req, res) => {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return res.status(400).json({ success: false, error: "Invalid header" });
	const id = auth.split(" ")[1];
	if (!/^[\w\d]{12}$/.test(id)) return res.status(400).json({ success: false, error: "Invalid ID" });
	db.get("SELECT id FROM users WHERE id = ?", id, (err, row: { id: string }) => {
		if (err) return res.status(500).json({ success: false, error: err.message });
		if (!row) res.status(404).json({ success: false, error: "User not found" });
		else db.run("UPDATE users SET notif_endpoint = NULL, notif_auth = NULL, notif_p256dh = NULL WHERE id = ?", id, err => {
			if (err) return res.status(500).json({ success: false, error: err.message });
			res.json({ success: true });
		});
	});
});

// Database
const ID_LENGTH = 12;
app.get("/filters", (req, res) => {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return res.status(400).json({ success: false, error: "Invalid header" });
	const id = auth.split(" ")[1];
	if (!/^[\w\d]{12}$/.test(id)) return res.status(400).json({ success: false, error: "Invalid ID" });
	db.get("SELECT filters, notif_endpoint FROM users WHERE id = ?", id, (err, row: { filters: string, notif_endpoint?: string }) => {
		if (err) return res.status(500).json({ success: false, error: err.message });
		if (!row) res.json({ success: true, filters: [], notif: false });
		else res.json({ success: true, filters: JSON.parse(row.filters), notif: !!row.notif_endpoint });
	});
});

app.post("/filters", jsonParser, (req, res) => {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return res.status(400).json({ success: false, error: "Invalid header" });
	const id = auth.split(" ")[1];
	if (!/^[\w\d]{12}$/.test(id)) return res.status(400).json({ success: false, error: "Invalid ID" });
	const filters = req.body.filters;
	if (!Array.isArray(filters)) return res.status(400).json({ success: false, error: "Invalid filters" });
	db.get("SELECT filters FROM users WHERE id = ?", id, (err, row: { filters: any[] }) => {
		if (err) return res.status(500).json({ success: false, error: err.message });
		if (!row) db.run("INSERT INTO users (id, filters) VALUES (?, '[]')", id, err => {
			if (err) return res.status(500).json({ success: false, error: err.message });
			res.json({ success: true });
		});
		else {
			if (deepEquality(filters, row.filters)) return res.json({ success: true });
			db.run("UPDATE users SET filters = ? WHERE id = ?", [JSON.stringify(filters), id], err => {
				if (err) return res.status(500).json({ success: false, error: err.message });
				res.json({ success: true });
			});
		}
	});
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`)
});