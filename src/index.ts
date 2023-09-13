import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import * as fs from "fs";
import path from "path";
import webpush from "web-push";
import sanitize from "sanitize-filename";
import { verbose } from "sqlite3";
import { deepEquality } from "@santi100/equal-lib";
import { ungrantedNotify } from "./helpers/notifier";
import { getId } from "./helpers/express";
import { createUser, getUsersRow, updateFilters, addSubscription, userExists, setNotify } from "./helpers/database";
// Cron job setup
import { getSchedules } from "./helpers/cron";
import { AddressInfo } from "net";
const sqlite3 = verbose();

// Database setup
export const db = new sqlite3.Database("users.db");
db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='users' OR name='subscriptions')", (err, rows: { name: string }[]) => {
	if (err) throw err;
	if (!rows.find(r => r.name === "users"))
		db.run("CREATE TABLE users (id CHAR(12) PRIMARY KEY, filters JSON NOT NULL, notif TINYINT(1))");
	if (!rows.find(r => r.name === "subscriptions"))
		db.run("CREATE TABLE subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id CHAR(12) NOT NULL, endpoint VARCHAR(255), auth VARCHAR(255), p256dh VARCHAR(255))");
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
		else if (subscription) await addSubscription(db, id, subscription);
		else await setNotify(db, id, true);
		res.json({ success: true });
		const payload = JSON.stringify({
			title: "Testing... 1, 2, 3!",
			body: "It looks like push notification is working!",
			icon: "/assets/images/icon.svg",
			badge: "/assets/images/badge.svg"
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
		if (!(await userExists(db, id))) return res.status(404).json({ success: false, error: "User not found" });
		else await setNotify(db, id, false);
		res.json({ success: true });
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
		else res.json({ success: true, notif: await ungrantedNotify(db, getSchedules(), id) });
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
		const row = <{ filters: string, notif?: number }>await getUsersRow(db, id, ["filters", "notif"]);
		if (!row) res.json({ success: true, filters: [], notif: false });
		else res.json({ success: true, filters: JSON.parse(row.filters), notif: !!row.notif });
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
		const row = <{ filters: any[] }>await getUsersRow(db, id, ["filters"]);
		if (!row) await createUser(db, id, { filters: JSON.stringify(filters) });
		else if (!deepEquality(filters, row.filters)) await updateFilters(db, id, JSON.stringify(filters));
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log(`App listening on port ${(<AddressInfo>listener.address()).port}`)
});