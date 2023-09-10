// Event that shows a notification when is received by push
self.addEventListener('push', event => {
	const data = event.data.json();
	self.registration.showNotification(data.title, {
		body: data.body,
		icon: data.icon || "/assets/images/zoomin.png"
	});
});