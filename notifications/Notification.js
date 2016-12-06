"use strict";

class Notification {
	
	constructor(notifier)
	{
		this.notifier = notifier;
	}

	send()
	{
		var channels = this.notifier.via();

		channels.forEach(function(channel)
		{
			var channelName = channel.charAt(0).toUpperCase() + channel.slice(1);
			var fn = 'to' + channelName;

			if(typeof this.notifier[fn] === 'function')
			{
				this.notifier[fn]().send();
			}
		}.bind(this));
	}
}

module.exports = Notification;