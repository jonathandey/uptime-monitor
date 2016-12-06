"use strict";

var Mail = require('./channels/Mail');
var Console = require('./channels/Console');

class SiteDownNotification {

	constructor(site)
	{
		this.site = site;
	}

	toMail(msg)
	{
		return new Mail().setBody(msg);
	}

	toConsole(msg)
	{
		return new Console().setBody(msg);
	}

	via()
	{
		return ['mail', 'console'];
	}

}

module.exports = SiteDownNotification;