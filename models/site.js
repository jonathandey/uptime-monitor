var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var sitesFolder = process.env.SITES_FOLDER || 'storage/sites';
var sitesPath = path.join(__dirname, '/../', sitesFolder);

var site = {
	_defaults: {
		interval: 300000, // 5 minutes
		pause: false
	},

	create: function(url, data)
	{
		fs.writeFileSync(path.join(sitesPath, this.encodeUrl(url)), data);
	},
	all: function()
	{
		// Todo: loop through folders and extract files

		return fs.readdirSync(sitesPath).filter(function(file)
		{
			// Filter out anything but files. Ignore files begining with a .
			return fs.statSync(path.join(sitesPath, file)).isFile() && file.indexOf('.') !== 0;
		});
	},
	find: function(url)
	{
		try {
			var data = fs.readFileSync(path.join(sitesPath, url));
			return yaml.safeLoad(data);
		} catch (error) {
			return null;
		}
	},
	exists: function(url)
	{
		try {
			return fs.statSync(path.join(sitesPath, this.encodeUrl(url)));
		} catch (error) {
			return false;
		}
	},
	encodeUrl(url)
	{
		var buff = new Buffer(url);

		return buff.toString('base64');
	},
	decodeUrl(str)
	{
		return Buffer.from(str, 'base64').toString();
	}
}

module.exports = site;