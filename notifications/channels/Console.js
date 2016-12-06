"use strict";

class Console {

	setBody(msg)
	{
		this.body = msg;

		return this;
	}

	send()
	{
		return console.log(this.body);
	}

}

module.exports = Console;