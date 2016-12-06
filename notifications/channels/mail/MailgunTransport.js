"use strict";
const mailgun = require('mailgun-js');

class MailgunTransport {

	constructor(apiKey, domain)
	{
		this.apiKey = apiKey;
		this.domain = domain;

		this.sender = new mailgun({ apiKey: apiKey, domain: domain });
	}

	send(data)
	{
		this.sender.messages().send(data, function(error, body)
		{
			if(error)
			{
				console.log(error);
			}

			return body;
		})
	}
}

module.exports = MailgunTransport;