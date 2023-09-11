import { Database } from "sqlite3";
import webpush from "web-push";

export async function getRow(db: Database, id: string, columns: string[]) {
	return new Promise((res, rej) => {
		db.get(`SELECT ${columns.join(", ")} FROM users WHERE id = ?`, id, (err, row) => {
			if (err) return rej(err);
			res(row);
		});
	});
}

export async function userExists(db: Database, id: string) {
	return !!(await getRow(db, id, ["id"]));
}

export async function createUser(db: Database, id: string, extra?: { filters?: string, subscription?: webpush.PushSubscription }) {
	let columns: string[] = ["id", "filters"];
	let params: string[] = [id];
	if (!extra) params.push("[]");
	else {
		if (extra.filters) params.push(extra.filters);
		else params.push("[]");
		if (extra.subscription) {
			columns.push("notif_endpoint", "notif_auth", "notif_p256dh");
			params.push(extra.subscription.endpoint, extra.subscription.keys.auth, extra.subscription.keys.p256dh);
		}
	}
	const query = `INSERT INTO users (${columns.join(", ")}) VALUES (${Array(columns.length).fill("?").join(", ")})`;
	return new Promise<void>((res, rej) => {
		db.run(query, params, err => {
			if (err) return rej(err);
			res();
		});
	});
}

export async function updateFilters(db: Database, id: string, filters: string) {
	return new Promise<void>((res, rej) => {
		db.run("UPDATE users SET filters = ? WHERE id = ?", [filters, id], err => {
			if (err) return rej(err);
			res();
		});
	})
}

export async function updateSubscription(db: Database, id: string, subscription: webpush.PushSubscription) {
	return new Promise<void>((res, rej) => {
		db.run("UPDATE users SET notif_endpoint = ?, notif_auth = ?, notif_p256dh = ? WHERE id = ?", [subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh, id], err => {
			if (err) return rej(err)
			res();
		});
	});
}

export async function deleteSubscription(db: Database, id: string) {
	return new Promise<void>((res, rej) => {
		db.run("UPDATE users SET notif_endpoint = NULL, notif_auth = NULL, notif_p256dh = NULL WHERE id = ?", id, err => {
			if (err) return rej(err);
			res();
		});
	});
}