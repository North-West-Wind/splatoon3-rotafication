// Toggle subscription
const publicVapidKey = process.env.REACT_APP_PUBLIC_VAPID_KEY;
if (window.Notification) {
	if (Notification.permission != 'granted') {
		Notification.requestPermission(() => {
			if (Notification.permission === 'granted') {
				getSubscriptionObject().then(subscribe)
			}
		}).catch(function (err) {
			console.log(err);
		});
	}
}

// Generate subscription object
async function getSubscriptionObject() {
	const worker = await navigator.serviceWorker.register('/service-worker-push.js');
	return await worker.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
	});
}

// Send subscription to server
async function subscribe(subscription: PushSubscription, id?: string) {
	return await fetch(window.location.origin + '/subscribe', {
		method: 'POST',
		body: JSON.stringify({
			subscription: subscription,
			userId: id || crypto.randomUUID()
		}),
		headers: {
			'content-type': 'application/json'
		}
	});
}

// Decoder base64 to uint8
function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
