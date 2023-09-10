export async function registerServiceWorker() {
	return navigator.serviceWorker
		.register('/service-worker.js')
		.then(function (registration) {
			console.log('Service worker successfully registered.');
			return registration;
		})
		.catch(function (err) {
			console.error('Unable to register service worker.', err);
		});
}

export async function askPermission() {
	return new Promise(function (resolve, reject) {
		const permissionResult = Notification.requestPermission(function (result) {
			resolve(result);
		});

		if (permissionResult) {
			permissionResult.then(resolve, reject);
		}
	}).then((permissionResult) => permissionResult !== 'granted');
}

export async function subscribeUserToPush(pubKey: string) {
	return navigator.serviceWorker
		.register('/service-worker.js')
		.then(function (registration) {
			const subscribeOptions = {
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(pubKey),
			};

			return registration.pushManager.subscribe(subscribeOptions);
		})
		.then(function (pushSubscription) {
			console.log(
				'Received PushSubscription: ',
				JSON.stringify(pushSubscription),
			);
			return pushSubscription;
		});
}

function urlBase64ToUint8Array(base64String: string) {
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