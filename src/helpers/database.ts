import { Database } from "sqlite3";
import webpush from "web-push";

export async function getUsersRow(db: Database, id: string, columns: string[]) {
	return new Promise((res, rej) => {
		db.get(`SELECT ${columns.join(", ")} FROM users WHERE id = ?`, id, (err, row) => {
			if (err) return rej(err);
			res(row);
		});
	});
}

export async function userExists(db: Database, id: string) {
	return !!(await getUsersRow(db, id, ["id"]));
}

export async function createUser(db: Database, id: string, extra?: { filters?: string, subscription?: webpush.PushSubscription }) {
	let columns: string[] = ["id", "filters"];
	let params: any[] = [id];
	if (!extra) params.push("[]");
	else {
		if (extra.filters) params.push(extra.filters);
		else params.push("[]");
		if (extra.subscription) {
			columns.push("notif");
			params.push(1);
			db.run("INSERT INTO subscriptions (endpoint, auth, p256dh) VALUES (?, ?, ?)", [extra.subscription.endpoint, extra.subscription.keys.auth, extra.subscription.keys.p256dh]);
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

export async function setNotify(db: Database, id: string, state: boolean) {
	return new Promise<void>((res, rej) => {
		db.run("UPDATE users SET notif = ? WHERE id = ?", [state ? 1 : 0, id], err => {
			if (err) return rej(err);
			res();
		});
	});
}

export async function addSubscription(db: Database, id: string, subscription: webpush.PushSubscription) {
	return new Promise<void>((res, rej) => {
		db.run("INSERT INTO subscriptions (user_id, endpoint, auth, p256dh) VALUES (?, ?, ?, ?)", [id, subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh], err => {
			if (err) return rej(err);
			setNotify(db, id, true).then(res).catch(rej);
		});
	});
}

export async function delSubscriptions(db: Database, id: string) {
	return new Promise<void>((res, rej) => {
		db.run("DELETE FROM subscriptions WHERE user_id = ?", id, (err) => {
			if (err) rej(err);
			setNotify(db, id, false).then(res).catch(rej);
		})
	});
}