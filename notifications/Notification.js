"use strict";

class Notification {
	
	constructor(notifier)
	{
		this.notifier = notifier;
	}

	send(msg)
	{
		var channels = this.notifier.via();

		// Send via email
		if(channels.indexOf('mail') >= 0)
		{
			this.notifier.toMail(msg).send();
		}

		// Send to console
		if(channels.indexOf('console') >= 0)
		{
			this.notifier.toConsole(msg).send();
		}
	}
}

module.exports = Notification;