import bodyParser from "body-parser";
import { CronJob } from "cron";
import "dotenv/config";
import express from "express";
import path from "path";
import webpush from "web-push";
import { Splatoon3InkSchedulesResponse } from "./types/splatoon3ink";
import fetch from "node-fetch";

// Cron job setup
// One second buffer to make sure splatoon3.ink has updated
//                       v
new CronJob("* * * */2 0 1", async () => {
	const res = await fetch("https://splatoon3.ink/data/schedules.json");
	if (res.ok) {
		const data = (<Splatoon3InkSchedulesResponse>await res.json()).data;
	}
}, null, true, undefined, null, true, 0);

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

//Subscriptions
app.post('/subscribe', jsonParser, (req, res) => {
	const subscription = <webpush.PushSubscription>req.body.subscription;
	const userId = req.body.userId;
	console.dir(subscription);
	//TODO: Store subscription keys and userId in DB
	webpush.setVapidDetails(
		process.env.DOMAIN!,
		process.env.PUBLIC_VAPID_KEY!,
		process.env.PRIVATE_VAPID_KEY!
	);
	res.sendStatus(200);
	const payload = JSON.stringify({
		title: "Testing... 1, 2, 3!",
		body: "It looks like push notification is working!"
	});
	webpush.sendNotification(subscription, payload);
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`)
});