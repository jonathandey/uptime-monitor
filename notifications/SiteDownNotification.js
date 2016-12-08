"use strict";

var Mail = require('./channels/Mail');
var Console = require('./channels/Console');

class SiteDownNotification {

	constructor(site)
	{
		this.site = site;

		this.message = site.getAttribute('url') + ' is down!';
	}

	toMail()
	{
		return new Mail().setBody(this.message);
	}

	toConsole()
	{
		return new Console().setBody(this.message);
	}

	via()
	{
		return (this.site.notifications) ? this.site.notifications : ['console'];
	}

}

module.exports = SiteDownNotification;